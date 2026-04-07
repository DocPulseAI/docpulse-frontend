import { describe, expect, it } from 'vitest'

import {
    collectApiEndpoints,
    collectDataEntities,
    collectDetailedDataModels,
    getArchitectureReconstruction,
    getExecutionPaths,
    getImpactReportRoot,
    getImpactStats,
} from './documentPayloads'

describe('documentPayloads utilities', () => {
    it('extracts nested impact report root', () => {
        const payload = {
            impact: {
                report: {
                    report: {
                        analysis_summary: { severity_distribution: { MAJOR: 1 } },
                    },
                },
            },
        }

        const root = getImpactReportRoot(payload)
        expect(root.analysis_summary.severity_distribution.MAJOR).toBe(1)
    })

    it('reconstructs architecture from data_model and api_contract when architecture is empty', () => {
        const payload = {
            impact: {
                report: {
                    data_model: { entities: [{ id: 'User', name: 'User' }] },
                    api_contract: { endpoints: [{ method: 'GET', path: '/users' }] },
                },
            },
        }

        const arch = getArchitectureReconstruction(payload)
        expect(Array.isArray(arch.nodes)).toBe(true)
        expect(arch.nodes.length).toBeGreaterThan(0)
    })

    it('collects and deduplicates API endpoints from impact and document payloads', () => {
        const impact = {
            impact: {
                report: {
                    api_contract: {
                        endpoints: [{ method: 'get', path: '/users', source_file: 'routes.ts', controller: 'Users.list' }],
                    },
                },
            },
        }
        const docs = {
            content: {
                endpoints: [{ method: 'GET', path: '/users', source_file: 'doc', controller: 'doc' }],
            },
        }

        const endpoints = collectApiEndpoints(impact, docs)
        expect(endpoints).toHaveLength(1)
        expect(endpoints[0].method).toBe('GET')
        expect(endpoints[0].path).toBe('/users')
    })

    it('collects deduplicated data entities from multiple report sections', () => {
        const impact = {
            impact: {
                report: {
                    data_model: { entities: [{ id: 'User', name: 'User', file_path: 'models/user.ts' }] },
                    database_impact: { models: [{ id: 'User', name: 'User', file_path: 'models/user.ts' }] },
                    architecture_reconstruction: { nodes: [{ id: 'User', name: 'User', file_path: 'models/user.ts' }] },
                },
            },
        }

        const entities = collectDataEntities(impact)
        expect(entities).toHaveLength(1)
        expect(entities[0].name).toBe('User')
    })

    it('collects detailed data models and sorts by name', () => {
        const impact = {
            impact: {
                report: {
                    schema_analysis: {
                        models: [
                            {
                                model_name: 'Zeta',
                                source_file: 'z.ts',
                                fields: { id: { type: 'uuid', required: true } },
                                relationships: [],
                            },
                            {
                                model_name: 'Alpha',
                                source_file: 'a.ts',
                                fields: { id: { type: 'uuid', required: true } },
                                relationships: [],
                            },
                        ],
                    },
                },
            },
        }

        const models = collectDetailedDataModels(impact)
        expect(models.map((m) => m.name)).toEqual(['Alpha', 'Zeta'])
    })

    it('returns execution paths when present', () => {
        const impact = {
            impact: {
                report: {
                    call_graph_analysis: {
                        execution_paths: [{ from: 'A', to: 'B' }],
                    },
                },
            },
        }

        const paths = getExecutionPaths(impact)
        expect(paths).toEqual([{ from: 'A', to: 'B' }])
    })

    it('derives impact stats safely', () => {
        const impact = {
            impact: {
                report: {
                    analysis_summary: {
                        severity_distribution: { MAJOR: 2, MINOR: 3, PATCH: 4 },
                    },
                    affected_packages: ['api', 'service'],
                    impact_scope: { files: ['a.ts', 'b.ts'] },
                },
            },
        }

        const stats = getImpactStats(impact)
        expect(stats.severity.MAJOR).toBe(2)
        expect(stats.modules).toEqual(['api', 'service'])
        expect(stats.files).toEqual(['a.ts', 'b.ts'])
    })
})
