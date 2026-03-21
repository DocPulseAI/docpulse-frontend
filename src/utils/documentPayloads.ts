type LooseRecord = Record<string, any>

export interface NormalizedApiEndpoint {
  method: string
  path: string
  source_file: string
  controller: string
  description?: string
}

export interface NormalizedDataEntity {
  id: string
  name: string
  file_path: string
}

export interface DetailedDataModelEntity {
  name: string
  source_file: string
  fields: Array<{
    name: string
    type: string
    required: boolean
    description?: string
  }>
  relationships: Array<{
    target: string
    type: string
    cardinality: string
    name?: string
  }>
}

const isRecord = (value: unknown): value is LooseRecord => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

const toRecord = (value: unknown): LooseRecord => {
  if (isRecord(value)) return value
  if (typeof value !== 'string') return {}

  try {
    const parsed = JSON.parse(value)
    return isRecord(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
}

const getReportRoot = (value: unknown): LooseRecord => {
  let current = toRecord(value)
  let depth = 0

  while (depth < 4 && isRecord(current.report)) {
    current = current.report
    depth += 1
  }

  return current
}

export const getImpactReportRoot = (responseData: unknown): LooseRecord => {
  const payload = toRecord(responseData)
  return getReportRoot(payload.impact)
}

export const getArchitectureReconstruction = (responseData: unknown): LooseRecord => {
  const report = getImpactReportRoot(responseData)
  const arch = toRecord(report.architecture_reconstruction)
  if (arch.nodes || arch.components) return arch

  // Try to reconstruct from other parts of the report if architecture_reconstruction is empty
  const dataModel = toRecord(report.data_model)
  const apiContract = toRecord(report.api_contract)

  return {
    nodes: [
      ...(Array.isArray(dataModel.entities) ? dataModel.entities.map(e => ({ ...e, type: 'model' })) : []),
      ...(Array.isArray(apiContract.endpoints) ? apiContract.endpoints.map(e => ({ id: `${e.method} ${e.path}`, name: e.path, type: 'api' })) : [])
    ],
    edges: []
  }
}

export const getDataModelGraph = (impactResponseData: unknown) => {
  const report = getImpactReportRoot(impactResponseData)
  const dataModel = toRecord(report.data_model)
  const entities = Array.isArray(dataModel.entities) ? dataModel.entities : []
  const relationships = Array.isArray(dataModel.relationships) ? dataModel.relationships : []

  return {
    nodes: entities.map((e) => ({
      id: String(e.id || e.name || 'entity-id'),
      name: String(e.name || e.id),
      type: 'model',
      ...e
    })),
    edges: relationships.map((r) => ({
      source: String(r.from || r.source),
      target: String(r.to || r.target),
      label: r.type || 'relates to',
      ...r
    }))
  }
}

export const getExecutionPaths = (responseData: unknown): any[] => {
  const report = getImpactReportRoot(responseData)
  const callGraph = toRecord(report.call_graph_analysis)
  return Array.isArray(callGraph.execution_paths) ? callGraph.execution_paths : []
}

const normalizeApiEndpoint = (value: unknown): NormalizedApiEndpoint | null => {
  const endpoint = toRecord(value)
  const method = String(endpoint.method || '').toUpperCase()
  const path = String(endpoint.path || '').trim()

  if (!method || !path) return null

  return {
    method,
    path,
    source_file: String(endpoint.source_file || endpoint.router_file || endpoint.file || ''),
    controller: String(endpoint.controller || endpoint.source?.controller || ''),
    description: typeof endpoint.description === 'string' ? endpoint.description : undefined,
  }
}

const parseApiDescriptionContent = (responseData: unknown): LooseRecord => {
  const payload = toRecord(responseData)
  return toRecord(payload.content)
}

export const collectApiEndpoints = (
  impactResponseData: unknown,
  documentResponseData?: unknown
): NormalizedApiEndpoint[] => {
  const report = getImpactReportRoot(impactResponseData)
  const apiContract = toRecord(report.api_contract)
  const impactEndpoints = Array.isArray(apiContract.endpoints) ? apiContract.endpoints : []

  const docContent = parseApiDescriptionContent(documentResponseData)
  const docEndpoints = Array.isArray(docContent.endpoints) ? docContent.endpoints : []

  const seen = new Set<string>()
  const normalized = [...impactEndpoints, ...docEndpoints]
    .map(normalizeApiEndpoint)
    .filter((endpoint): endpoint is NormalizedApiEndpoint => Boolean(endpoint))
    .filter((endpoint) => {
      const key = `${endpoint.method} ${endpoint.path}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

  return normalized
}

const normalizeEntity = (value: unknown, index: number): NormalizedDataEntity | null => {
  const entity = toRecord(value)
  const name = String(entity.name || entity.id || '').trim()
  const filePath = String(entity.file_path || entity.file || entity.source_file || '').trim()

  if (!name) return null

  return {
    id: String(entity.id || name || `entity-${index}`),
    name,
    file_path: filePath,
  }
}

export const collectDataEntities = (impactResponseData: unknown): NormalizedDataEntity[] => {
  const report = getImpactReportRoot(impactResponseData)
  const dataModel = toRecord(report.data_model)
  const databaseImpact = toRecord(report.database_impact)
  const architecture = getArchitectureReconstruction(impactResponseData)

  const entityCandidates = [
    ...(Array.isArray(dataModel.entities) ? dataModel.entities : []),
    ...(Array.isArray(databaseImpact.models) ? databaseImpact.models : []),
    ...(Array.isArray(architecture.nodes) ? architecture.nodes : []),
    ...(Array.isArray(architecture.components) ? architecture.components : []),
  ]

  const seen = new Set<string>()
  return entityCandidates
    .map(normalizeEntity)
    .filter((entity): entity is NormalizedDataEntity => Boolean(entity))
    .filter((entity) => {
      const key = `${entity.name}:${entity.file_path}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export const collectDetailedDataModels = (impactResponseData: unknown): DetailedDataModelEntity[] => {
  const report = getImpactReportRoot(impactResponseData)
  const dataModel = report.data_model ? toRecord(report.report?.data_model || report.data_model) : {}
  const schemaAnalysis = toRecord(report.schema_analysis || report.report?.schema_analysis)

  // Try multiple places where models might be
  const rawModels = [
    ...(Array.isArray(schemaAnalysis.models) ? schemaAnalysis.models : []),
    ...(Array.isArray(dataModel.entities) ? dataModel.entities : []),
  ]

  const normalized: DetailedDataModelEntity[] = []
  const seenNames = new Set<string>()

  rawModels.forEach((m) => {
    const model = toRecord(m)
    const name = String(model.model_name || model.name || '').trim()
    if (!name || seenNames.has(name.toLowerCase())) return

    seenNames.add(name.toLowerCase())

    const fieldsObj = toRecord(model.fields)
    const normalizedFields = Object.entries(fieldsObj).map(([fieldName, fieldData]) => {
      const fd = toRecord(fieldData)
      return {
        name: fieldName,
        type: String(fd.type || fd.dataType || 'unknown'),
        required: Boolean(fd.required || fd.isNullable === false),
        description: typeof fd.description === 'string' ? fd.description : undefined
      }
    })

    const relsArr = Array.isArray(model.relationships) ? model.relationships : []
    const normalizedRels = relsArr.map((r) => {
      const rel = toRecord(r)
      return {
        target: String(rel.to || rel.target || rel.model || ''),
        type: String(rel.type || rel.relationship || ''),
        cardinality: String(rel.cardinality || ''),
        name: rel.name ? String(rel.name) : undefined
      }
    }).filter(r => r.target)

    normalized.push({
      name,
      source_file: String(model.source_file || model.file || ''),
      fields: normalizedFields,
      relationships: normalizedRels
    })
  })

  return normalized.sort((a, b) => a.name.localeCompare(b.name))
}

export const getImpactStats = (impactResponseData: unknown) => {
  const report = getImpactReportRoot(impactResponseData)
  const summary = toRecord(report.analysis_summary)
  const severityDistribution = toRecord(summary.severity_distribution)
  const impactScope = toRecord(report.impact_scope)

  return {
    severity: {
      MAJOR: Number(severityDistribution.MAJOR || severityDistribution.major || 0),
      MINOR: Number(severityDistribution.MINOR || severityDistribution.minor || 0),
      PATCH: Number(severityDistribution.PATCH || severityDistribution.patch || 0),
    },
    modules: toStringArray(report.affected_packages),
    files: toStringArray(impactScope.files || report.affected_files),
  }
}
