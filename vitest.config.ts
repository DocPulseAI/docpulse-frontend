import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        globals: true,
        clearMocks: true,
        restoreMocks: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'src/store/**',
                'src/services/api.ts',
                'src/components/AnalysisProgress.tsx',
                'src/components/AnalysisProgressModal.tsx',
                'src/components/AnalysisTimeline.tsx',
                'src/components/TeamPanel.tsx',
                'src/components/OverviewPanel.tsx',
                'src/components/SettingsPanel.tsx',
                'src/components/RunningPanel.tsx',
                'src/hooks/useProjectDetails.ts',
                'src/hooks/useRunStatus.ts',
                'src/pages/ProjectDetail.tsx',
                'node_modules/**',
                'src/design-system/**'
            ],
            thresholds: {
                statements: 70,
                branches: 50,
                functions: 60,
                lines: 70,
            }
        }
    },
})
