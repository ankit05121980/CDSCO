#!/usr/bin/env python3
"""Extra diagrams for the migration, transition and AI documents."""
from diagrams import (Canvas, NAVY, NAVY_D, SAFFRON, GREEN, LIGHT, LIGHT2, SURFACE,
                      INK, GRAY, RED, AMBER)


def d_migration_flow():
    c = Canvas(15, 8.5, 'Figure \u2014 Data Migration Pipeline')
    srcs = ['SUGAM', 'MD Online', 'SUGAM LABS', 'ONDLS', 'State Portals']
    for i, s in enumerate(srcs):
        c.box(3, 80 - i * 14, 16, 9, s, fc=LIGHT, fs=9, bold=True)
        c.arrow(19, 84.5 - i * 14, 26, 50, color=GRAY)
    stages = [('Extract', 26), ('Profile &\nCleanse', 41), ('Transform\n& Map', 56), ('Load', 71), ('Validate &\nReconcile', 84)]
    for t, x in stages:
        c.box(x, 44, 12, 12, t, fc=SAFFRON if t.startswith('Transform') else LIGHT2, tc=INK, fs=9, bold=True)
    for i in range(len(stages) - 1):
        c.arrow(stages[i][1] + 12, 50, stages[i + 1][1], 50, NAVY)
    c.box(80, 20, 16, 12, 'DDRS\n(PostgreSQL)', fc=NAVY, tc='white', fs=10, bold=True)
    c.arrow(90, 44, 88, 32, GREEN)
    c.box(26, 18, 34, 8, 'Staging area + data quality rules + audit', fc=SURFACE, ec=NAVY, fs=8)
    c.label(50, 92, 'Incremental, reconciled, reversible migration', fs=10, bold=True, color=NAVY)
    c.save('migration_flow.png')


def d_transition_timeline():
    c = Canvas(15, 7.5, 'Figure \u2014 Transition & Post-Go-Live Lifecycle')
    phases = [('Knowledge\nAcquisition', 4, GREEN), ('Refactoring &\nMigration', 22, NAVY),
              ('Upgradation\n(CI/CD)', 40, SAFFRON), ('Operations &\nMaintenance', 58, NAVY),
              ('Continuous\nImprovement', 76, GREEN)]
    for t, x, col in phases:
        c.box(x, 50, 18, 12, t, fc=col, tc='white', fs=9, bold=True)
        c.arrow(x + 18, 56, x + 18 + 2, 56, GRAY) if x < 76 else None
    c.ax.add_line(__import__('matplotlib').lines.Line2D([4, 94], [46, 46], color=GRAY, lw=1))
    bands = ['Corrective', 'Adaptive', 'Perfective', 'Preventive']
    for i, b in enumerate(bands):
        c.box(4 + i * 23, 26, 21, 8, b + ' maintenance', fc=LIGHT, fs=8.5)
    c.box(4, 10, 90, 8, 'Throughout: SLAs \u00b7 monitoring/observability \u00b7 security patching \u00b7 backup/DR \u00b7 documentation \u00b7 exit-readiness', fc=SURFACE, ec=NAVY, fs=8.5)
    c.save('transition_timeline.png')


def d_ai_architecture():
    c = Canvas(15, 9, 'Figure \u2014 AI-Ready Architecture (Plug-in Intelligence)')
    c.box(6, 60, 26, 22, 'DDRS Platform\n\nVersioned OpenAPI\nover all modules\n\nData & document\nstores', fc=NAVY, tc='white', fs=9.5, bold=True)
    c.box(40, 62, 20, 14, 'AI Gateway /\nOrchestration\n(MCP, agents)', fc=SAFFRON, tc='white', fs=10, bold=True)
    c.arrow(32, 70, 40, 70, NAVY, style='<|-|>')
    svcs = ['RAG Assistant', 'Summarisation', 'Classification', 'Doc Comparison',
            'Completeness\nCheck', 'Inspection Report\nGeneration', 'Anonymisation',
            'Fraud / Anomaly\nAnalytics']
    for i, s in enumerate(svcs):
        col = i % 4; row = i // 4
        c.box(66 + col * 0, 0, 0, 0, '', fc=LIGHT)  # noop
    for i, s in enumerate(svcs):
        row = i // 2; col = i % 2
        c.box(64 + col * 17, 70 - row * 11, 16, 9, s, fc='white', ec=GREEN, fs=8)
        c.arrow(60, 69, 64 + col * 17, 74 - row * 11, GREEN, ls='-')
    c.box(40, 30, 20, 10, 'Vector store /\nKnowledge index', fc=LIGHT2, ec=NAVY, fs=9)
    c.arrow(50, 62, 50, 40, NAVY, style='<|-|>')
    c.box(6, 30, 26, 10, 'Governance & Guardrails:\nPII protection, audit, human-in-loop,\nmodel registry, evaluation', fc=LIGHT, ec=RED, fs=8.5)
    c.label(50, 90, 'AI developed separately; DDRS exposes standardised APIs for plug-in integration', fs=9.5, bold=True, color=NAVY)
    c.save('ai_architecture.png')


def d_ai_usecases():
    c = Canvas(14, 8.5, 'Figure \u2014 Regulatory AI Use-Case Map')
    groups = {
        'Document Intelligence': (['Summarisation', 'Completeness check', 'Comparison', 'Classification'], GREEN, 6, 70),
        'Decision Support': (['RAG assistant', 'Inspection report gen.', 'Risk scoring'], NAVY, 6, 34),
        'Integrity & Safety': (['Fraud/anomaly analytics', 'Duplicate detection', 'PII anonymisation'], RED, 52, 70),
        'Automation': (['Multi-agent workflows (MCP)', 'Auto-routing/allocation', 'Alert generation'], SAFFRON, 52, 34),
    }
    for name, (items, col, x, y) in groups.items():
        c.label(x + 20, y + 18, name, fs=11, bold=True, color=col)
        for i, it in enumerate(items):
            c.box(x + (i % 2) * 22, y + 10 - (i // 2) * 7, 20, 6, it, fc='white', ec=col, fs=8.5)
    c.save('ai_usecases.png')


if __name__ == '__main__':
    for fn in [d_migration_flow, d_transition_timeline, d_ai_architecture, d_ai_usecases]:
        fn()
    print('extra diagrams done')
