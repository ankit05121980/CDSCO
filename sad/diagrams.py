#!/usr/bin/env python3
"""Generate professional, CDSCO-branded architecture / DFD / sequence diagrams
for the DDRS SAD using matplotlib (no external binaries required)."""
import os, json, math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle, Circle
from matplotlib.lines import Line2D

OUT = os.path.join(os.path.dirname(__file__), 'images')
os.makedirs(OUT, exist_ok=True)

NAVY = '#0b3d7b'; NAVY_D = '#082244'; SAFFRON = '#FF9933'; GREEN = '#138808'
LIGHT = '#d6e4f5'; LIGHT2 = '#eef4fb'; SURFACE = '#f6f8fb'; INK = '#1f2933'
GRAY = '#94a3b8'; WHITE = '#ffffff'; AMBER = '#f59e0b'; RED = '#dc2626'

plt.rcParams['font.family'] = 'DejaVu Sans'


class Canvas:
    def __init__(self, w=14, h=9, title=''):
        self.fig, self.ax = plt.subplots(figsize=(w, h))
        self.ax.set_xlim(0, 100); self.ax.set_ylim(0, 100)
        self.ax.axis('off')
        self.W, self.H = w, h
        if title:
            self.ax.add_patch(Rectangle((0, 95), 100, 5, color=NAVY))
            self.ax.text(2, 97.5, title, color='white', fontsize=15, fontweight='bold', va='center')
            # tricolour strip
            self.ax.add_patch(Rectangle((0, 94.2), 33.3, 0.8, color=SAFFRON))
            self.ax.add_patch(Rectangle((33.3, 94.2), 33.3, 0.8, color='white'))
            self.ax.add_patch(Rectangle((66.6, 94.2), 33.4, 0.8, color=GREEN))

    def box(self, x, y, w, h, text, fc=LIGHT, ec=NAVY, tc=INK, fs=9, bold=False, round=True, lw=1.2):
        style = "round,pad=0.02,rounding_size=0.6" if round else "square,pad=0.02"
        self.ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=style, fc=fc, ec=ec, lw=lw))
        self.ax.text(x + w / 2, y + h / 2, text, ha='center', va='center',
                     color=tc, fontsize=fs, fontweight='bold' if bold else 'normal', wrap=True)

    def label(self, x, y, text, fs=9, color=INK, bold=False, ha='center', va='center'):
        self.ax.text(x, y, text, ha=ha, va=va, color=color, fontsize=fs,
                     fontweight='bold' if bold else 'normal')

    def arrow(self, x1, y1, x2, y2, color=NAVY, style='-|>', lw=1.5, ls='-'):
        self.ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style,
                          mutation_scale=14, color=color, lw=lw, linestyle=ls,
                          shrinkA=2, shrinkB=2))

    def save(self, name):
        self.fig.savefig(os.path.join(OUT, name), dpi=150, bbox_inches='tight',
                         facecolor=SURFACE)
        plt.close(self.fig)
        print('  wrote', name)


def d_context():
    c = Canvas(14, 9, 'Figure 1 — DDRS System Context')
    c.box(38, 44, 24, 12, 'DDRS\nDigital Drugs\nRegulatory System', fc=NAVY, tc='white', fs=12, bold=True)
    actors_l = ['Manufacturers /\nImporters / Exporters', 'Wholesalers /\nRetailers / Pharmacies', 'CROs / Ethics\nCommittees', 'Citizens /\nPublic']
    for i, a in enumerate(actors_l):
        y = 78 - i * 18
        c.box(3, y, 20, 11, a, fc=LIGHT, fs=9)
        c.arrow(23, y + 5.5, 38, 50, color=GREEN)
    actors_r = ['CDSCO HQ /\nZonal / Port Offices', 'State Licensing\nAuthorities', 'Central / State /\nPrivate Labs', 'DTAB / DCC /\nSEC Committees']
    for i, a in enumerate(actors_r):
        y = 78 - i * 18
        c.box(77, y, 20, 11, a, fc=LIGHT2, fs=9)
        c.arrow(77, y + 5.5, 62, 50, color=NAVY)
    c.box(34, 14, 32, 9, '35 Government & External Systems\n(Aadhaar, GST, Customs, Bharat Kosh, DigiLocker,\nCTRI, NPPA, ABDM, QCI, IPC, NIB …)', fc=SAFFRON, tc='white', fs=8, bold=True)
    c.arrow(50, 44, 50, 23, color=SAFFRON, style='<|-|>')
    c.save('context.png')


def d_layered():
    c = Canvas(14, 10, 'Figure 2 — Layered (Logical) Architecture')
    layers = [
        ('PRESENTATION — React 18 + Vite + Tailwind (SPA)\nPublic site · Industry · CDSCO · State · Lab · Admin portals', 82, LIGHT2),
        ('API LAYER — NestJS Controllers (REST, OpenAPI/Swagger)\nGlobal JWT Auth Guard · RBAC Guard · Audit Interceptor · Validation', 66, LIGHT),
        ('DOMAIN / SERVICE LAYER — 20+ feature modules\nWorkflow engine · Fee/Payment · Licensing/QR · LIMS · Vigilance · Analytics', 50, '#bcd2ee'),
        ('DATA ACCESS — TypeORM Repositories + generic pagination/search', 38, LIGHT),
        ('PERSISTENCE — SQLite (dev) ⇄ PostgreSQL (prod)  ·  37 entities', 26, LIGHT2),
    ]
    for txt, y, fc in layers:
        c.box(8, y, 72, 12, txt, fc=fc, fs=10, bold=True)
        if y > 26:
            c.arrow(44, y, 44, y - 4, color=NAVY, style='<|-|>')
    # cross-cutting
    c.box(83, 26, 13, 68, 'CROSS-CUTTING\n\nAuthN / AuthZ\n\nAudit Trail\n\nReference &\nQR Service\n\nNotifications\n\nValidation\n\nError\nHandling', fc=NAVY, tc='white', fs=8.5, bold=True)
    c.save('layered.png')


def d_components():
    c = Canvas(15, 10, 'Figure 3 — Component / Module Map')
    groups = {
        'PLATFORM CORE': (['Auth', 'Users / RBAC', 'Audit', 'Notifications', 'Documents / e-Sign', 'Reference + QR'], NAVY, 6, 70),
        'REGISTRIES': (['Organizations', 'Technical Persons', 'Laboratories', 'Products', 'Master Data'], GREEN, 6, 38),
        'REGULATORY': (['Applications (Workflow)', 'Payments', 'Licensing / Certs / NOC', 'Inspections', 'Enforcement', 'Laboratory (LIMS)', 'Clinical Trials', 'Vigilance'], SAFFRON, 38, 38),
        'PLATFORM SERVICES': (['Supply Chain', 'Returns', 'Grievances', 'Integrations (35)', 'Analytics / SHRESTH', 'Public APIs'], '#6741d9', 72, 70),
    }
    for name, (mods, color, gx, gy) in groups.items():
        c.label(gx + 11, gy + 20, name, fs=11, bold=True, color=color)
        for i, m in enumerate(mods):
            col = i % 2; row = i // 2
            c.box(gx + col * 12, gy + 14 - row * 6.5, 11, 5.2, m, fc='white', ec=color, fs=8)
    c.save('components.png')


def d_deployment():
    c = Canvas(14, 9.5, 'Figure 4 — Deployment View')
    c.box(4, 70, 40, 16, 'Option A — Single Node (no Docker)\n\nnode backend/dist/main.js\nserves API (/api) + built SPA on one port\n\npnpm start:prod', fc=LIGHT, fs=9)
    c.box(56, 70, 40, 16, 'Option B — Docker (SQLite)\n\ndocker compose up --build\nauto-seed on first boot\nvolume: ddrs-data', fc=LIGHT2, fs=9)
    c.box(30, 40, 40, 16, 'Option C — Docker + PostgreSQL\n\nddrs container  +  postgres:16\nDB_TYPE=postgres  ·  durable storage\nprofile: postgres', fc='#bcd2ee', fs=9)
    c.box(8, 10, 36, 16, 'Client (Browser)\nDesktop / Mobile PWA', fc=SAFFRON, tc='white', fs=10, bold=True)
    c.box(56, 10, 36, 16, 'Reverse Proxy / LB (TLS)\nnginx / Cloud LB\n→ DDRS :3001', fc=NAVY, tc='white', fs=10, bold=True)
    c.arrow(44, 18, 56, 18, color=NAVY, style='<|-|>')
    c.arrow(74, 26, 50, 40, color=NAVY)
    c.save('deployment.png')


def er(name, title, tables):
    c = Canvas(15, 10, title)
    # tables: list of (label, x, y, fields, color)
    placed = {}
    for label, x, y, fields, color in tables:
        h = 4 + len(fields) * 2.6
        c.ax.add_patch(FancyBboxPatch((x, y - h), 22, h, boxstyle="round,pad=0.02,rounding_size=0.4",
                       fc='white', ec=color, lw=1.6))
        c.ax.add_patch(Rectangle((x, y - 3.2), 22, 3.2, color=color))
        c.ax.text(x + 11, y - 1.6, label, ha='center', va='center', color='white', fontsize=9.5, fontweight='bold')
        for i, fld in enumerate(fields):
            c.ax.text(x + 1.2, y - 4.8 - i * 2.6, fld, ha='left', va='center', color=INK, fontsize=7.6)
        placed[label] = (x, y, h)
    return c, placed


def d_er_core():
    tables = [
        ('organizations', 6, 90, ['id (PK)', 'name, type', 'registrationNo (U)', 'gstin, pan, cin', 'stateCode, geo', 'status'], GREEN),
        ('products', 6, 50, ['id (PK)', 'brandName (U)', 'category', 'manufacturerId (FK)', 'riskClass', 'status'], GREEN),
        ('applications', 38, 92, ['id (PK)', 'referenceNo (U)', 'type, status', 'organizationId (FK)', 'productCategory', 'feeAmount, slaDays', 'assignedToId'], SAFFRON),
        ('application_events', 38, 50, ['id (PK)', 'applicationId (FK)', 'fromStatus→toStatus', 'action, actor', 'remarks'], SAFFRON),
        ('payments', 70, 92, ['id (PK)', 'referenceNo (U)', 'applicationId (FK)', 'amount, mode', 'gateway, status', 'txnRef'], NAVY),
        ('licenses', 70, 56, ['id (PK)', 'referenceNo (U)', 'applicationId (FK)', 'holderOrgId (FK)', 'validTo, status', 'qrPayload'], NAVY),
        ('certificates', 70, 22, ['id (PK)', 'referenceNo (U)', 'certType, isNoc', 'holderOrgId (FK)', 'status, qrPayload'], NAVY),
    ]
    c, p = er('er_core', 'Figure 5 — Core Domain ER (Applications, Licensing, Payments)', tables)
    c.arrow(28, 70, 38, 78, GRAY); c.label(31, 76, '1:N', fs=7, color=GRAY)
    c.arrow(28, 42, 38, 60, GRAY)
    c.arrow(49, 60, 49, 56, GRAY); c.label(52, 58, 'events', fs=7, color=GRAY)
    c.arrow(60, 80, 70, 84, GRAY); c.label(64, 84, 'pays', fs=7, color=GRAY)
    c.arrow(60, 74, 70, 64, GRAY); c.label(64, 70, 'issues', fs=7, color=GRAY)
    c.save('er_core.png')


def d_er_ops():
    tables = [
        ('inspections', 6, 90, ['id (PK)', 'referenceNo (U)', 'type, formType', 'entityId (FK)', 'status, outcome', 'geo, inspectors'], SAFFRON),
        ('inspection_findings', 6, 46, ['id (PK)', 'inspectionId (FK)', 'observation', 'severity, status'], SAFFRON),
        ('samples', 38, 92, ['id (PK)', 'referenceNo (U)', 'productName, batch', 'labId (FK)', 'sampleType, status'], GREEN),
        ('test_reports', 38, 52, ['id (PK)', 'referenceNo (U)', 'sampleId (FK)', 'result', 'parameters[]'], GREEN),
        ('enforcement_cases', 70, 92, ['id (PK)', 'referenceNo (U)', 'classification', 'batchNo, severity', 'interState, status'], RED),
        ('recalls', 70, 56, ['id (PK)', 'referenceNo (U)', 'classification', 'qty supplied/recalled', 'status'], RED),
        ('adverse_events', 70, 22, ['id (PK)', 'referenceNo (U)', 'type, seriousness', 'causality, source', 'status'], '#6741d9'),
    ]
    c, p = er('er_ops', 'Figure 6 — Regulatory Operations ER (Inspections, LIMS, Enforcement, Vigilance)', tables)
    c.arrow(14, 70, 14, 50, GRAY); c.label(18, 60, 'findings', fs=7, color=GRAY)
    c.arrow(49, 70, 49, 56, GRAY); c.label(52, 63, 'tested→report', fs=7, color=GRAY)
    c.save('er_ops.png')


def d_dfd_l0():
    c = Canvas(14, 9, 'Figure 7 — Data Flow Diagram (Level 0 / Context)')
    c.add = None
    c.ax.add_patch(Circle((50, 50), 13, fc=NAVY, ec=NAVY_D, lw=2))
    c.label(50, 50, 'DDRS\n(0)', fs=13, color='white', bold=True)
    ext = [('Applicant', 12, 78, 'applications, docs, fees', 'status, licence, QR'),
           ('CDSCO/State\nOfficer', 12, 22, 'reviews, decisions', 'work queue, MIS'),
           ('Laboratory', 88, 78, 'test results, BRC', 'sample assignment'),
           ('External\nSystems (35)', 88, 22, 'verifications', 'API calls')]
    for name, x, y, inflow, outflow in ext:
        c.box(x - 9, y - 5, 18, 10, name, fc=LIGHT, fs=9, bold=True)
        c.arrow(x, y, 50, 50, color=GREEN)
        c.arrow(50, 50, x, y - 0.5, color=SAFFRON)
    c.label(50, 8, 'Data stores: D1 Registries · D2 Applications · D3 Licences/Certs · D4 Lab · D5 Audit', fs=8, color=GRAY)
    c.save('dfd_l0.png')


def d_dfd_licensing():
    c = Canvas(15, 8.5, 'Figure 8 — DFD Level 1: Licensing & Approval')
    steps = [('1.0\nCapture\nApplication', 8), ('2.0\nFee\nPayment', 26), ('3.0\nPre-screen\n& Allocate', 44),
             ('4.0\nTechnical\nReview', 62), ('5.0\nApprove &\nIssue (QR)', 80)]
    for t, x in steps:
        c.box(x, 55, 14, 12, t, fc=LIGHT, fs=9, bold=True)
    for i in range(len(steps) - 1):
        c.arrow(steps[i][1] + 14, 61, steps[i + 1][1], 61, NAVY)
    c.box(2, 30, 20, 7, 'Applicant (external)', fc=GREEN, tc='white', fs=9)
    c.box(78, 30, 18, 7, 'Officer (internal)', fc=NAVY, tc='white', fs=9)
    c.box(30, 18, 18, 7, 'D2 Applications', fc=SURFACE, ec=NAVY, fs=8)
    c.box(54, 18, 18, 7, 'D3 Licences / Certs', fc=SURFACE, ec=NAVY, fs=8)
    c.arrow(12, 37, 13, 55, GREEN); c.arrow(33, 55, 60, 37, NAVY)
    c.arrow(39, 55, 39, 25, GRAY); c.arrow(70, 55, 63, 25, GRAY)
    c.save('dfd_licensing.png')


def d_workflow():
    c = Canvas(15, 8.5, 'Figure 9 — Application Workflow State Machine')
    states = [('DRAFT', 6, 50, GRAY), ('SUBMITTED', 20, 50, NAVY), ('PRE_SCREENING', 34, 50, NAVY),
              ('UNDER_REVIEW', 50, 50, SAFFRON), ('RECOMMENDED', 66, 50, SAFFRON),
              ('APPROVED', 80, 62, GREEN), ('ISSUED', 92, 62, GREEN), ('REJECTED', 80, 34, RED)]
    pos = {}
    for s, x, y, col in states:
        c.box(x - 6, y - 3.5, 13, 7, s, fc=col, tc='white', fs=8, bold=True); pos[s] = (x, y)
    seq = ['DRAFT', 'SUBMITTED', 'PRE_SCREENING', 'UNDER_REVIEW', 'RECOMMENDED']
    for a, b in zip(seq, seq[1:]):
        c.arrow(pos[a][0] + 7, pos[a][1], pos[b][0] - 6, pos[b][1], NAVY)
    c.arrow(pos['RECOMMENDED'][0] + 6, 51, pos['APPROVED'][0] - 6, 61, GREEN)
    c.arrow(pos['APPROVED'][0] + 7, 62, pos['ISSUED'][0] - 6, 62, GREEN)
    c.arrow(pos['RECOMMENDED'][0], 47, pos['REJECTED'][0] - 6, 36, RED)
    c.box(34, 22, 16, 6, 'QUERY_RAISED', fc=AMBER, tc='white', fs=8)
    c.arrow(50, 46.5, 44, 28, AMBER); c.arrow(44, 28, 40, 46.5, AMBER)
    c.box(6, 20, 16, 6, 'Post-issue: RENEWED / SUSPENDED /\nCANCELLED / SURRENDERED', fc=LIGHT, fs=7)
    c.arrow(86, 58, 22, 24, GRAY, ls='--')
    c.save('workflow.png')


def d_rbac():
    c = Canvas(14, 9, 'Figure 10 — RBAC: Roles → Portals')
    portals = [('CDSCO Central', NAVY, 80), ('State Regulator', GREEN, 62), ('Laboratory', SAFFRON, 44), ('Industry / Applicant', '#6741d9', 26), ('Administration', NAVY_D, 8)]
    for name, col, y in portals:
        c.box(60, y, 34, 12, name, fc=col, tc='white', fs=10, bold=True)
    roles = [('DCGI, ADC, Review Officer,\nDrug Inspector, Port Officer', 80, NAVY),
             ('State Licensing Authority,\nState Drug Inspector', 62, GREEN),
             ('Lab Manager, Lab Analyst', 44, SAFFRON),
             ('Manufacturer, Importer, Exporter,\nWholesaler, CRO, Ethics, Blood Centre', 26, '#6741d9'),
             ('Super Admin', 8, NAVY_D)]
    for txt, y, col in roles:
        c.box(6, y, 44, 12, txt, fc='white', ec=col, fs=8.5)
        c.arrow(50, y + 6, 60, y + 6, col)
    c.label(28, 95, '19 roles', fs=10, bold=True, color=NAVY)
    c.save('rbac.png')


def d_integrations():
    c = Canvas(14, 9.5, 'Figure 11 — Integration Landscape (35 systems)')
    c.box(40, 45, 20, 10, 'DDRS\nIntegrations Hub', fc=NAVY, tc='white', fs=11, bold=True)
    cats = {
        'Identity & Docs': (['Aadhaar', 'PAN', 'DigiLocker', 'CDAC eSign'], 10, 82, GREEN),
        'Payments': (['Bharat Kosh', 'State Treasury'], 10, 58, SAFFRON),
        'Trade': (['Customs/ICEGATE', 'DGFT', 'Commerce', 'DGCI&S'], 10, 30, NAVY),
        'Health & Research': (['ABDM', 'ICMR/CTRI', 'NMC', 'INC', 'NIB', 'IPC'], 78, 82, '#6741d9'),
        'Standards & Reg.': (['BIS', 'QCI', 'NPPA', 'FSSAI', 'CBN', 'AERB'], 78, 52, AMBER),
        'Corporate & Env.': (['MCA/RoC', 'GST', 'CPCB', 'Factories', 'GeM', 'ONDC'], 78, 22, GREEN),
    }
    for name, (items, x, y, col) in cats.items():
        c.label(x + 6, y + 6, name, fs=9, bold=True, color=col)
        c.box(x, y - len(items) * 2.4, 16, len(items) * 2.4 + 2, '\n'.join(items), fc='white', ec=col, fs=7.5)
        c.arrow(x + 8, y - len(items) * 1.2, 50, 50, col, ls='-')
    c.save('integrations.png')


def sequence(name, title, actors, msgs):
    c = Canvas(14, 9, title)
    n = len(actors)
    xs = [10 + i * (84 / (n - 1)) for i in range(n)]
    top = 86; bottom = 12
    for i, a in enumerate(actors):
        c.box(xs[i] - 7, top, 14, 6, a, fc=NAVY if i == 0 else LIGHT, tc='white' if i == 0 else INK, fs=8.5, bold=True)
        c.ax.add_line(Line2D([xs[i], xs[i]], [top, bottom], color=GRAY, ls='--', lw=1))
    y = top - 6
    for frm, to, txt, back in msgs:
        y -= (84 - 18) / (len(msgs) + 1)
        x1, x2 = xs[frm], xs[to]
        c.arrow(x1, y, x2, y, SAFFRON if back else NAVY, ls='--' if back else '-')
        midx = (x1 + x2) / 2
        c.label(midx, y + 1.6, txt, fs=7.5, color=INK)
    c.save(name)


def d_seq_application():
    sequence('seq_application.png', 'Figure 12 — Sequence: Application Lifecycle',
             ['Applicant', 'API/Auth', 'Workflow', 'Payments', 'Licensing', 'Officer'],
             [(0, 1, 'create application', False), (1, 2, 'persist DRAFT', False),
              (0, 2, 'submit', False), (2, 3, 'create fee (Bharat Kosh)', False),
              (3, 0, 'pay → PAID', True), (2, 2, 'auto-allocate (masked)', False),
              (5, 2, 'review → recommend', False), (5, 2, 'approve', False),
              (2, 4, 'issue licence + QR', False), (4, 0, 'licence ISSUED', True)])


def d_seq_login():
    sequence('seq_login.png', 'Figure 13 — Sequence: Authentication (Password / OTP / Aadhaar)',
             ['User', 'Frontend', 'Auth Service', 'Users', 'JWT'],
             [(0, 1, 'enter credentials / OTP / Aadhaar', False), (1, 2, 'POST /auth/*', False),
              (2, 3, 'verify user', False), (3, 2, 'user + roles', True),
              (2, 4, 'sign token', False), (4, 2, 'JWT (12h)', True),
              (2, 1, 'accessToken + profile', True), (1, 0, 'redirect to portal', True)])


def d_seq_verify():
    sequence('seq_verify.png', 'Figure 14 — Sequence: Public Licence/Certificate Verification',
             ['Public', 'SPA', 'Licensing API', 'DB', 'QR Svc'],
             [(0, 1, 'enter ref / scan QR', False), (1, 2, 'GET /verify/:ref (public)', False),
              (2, 3, 'lookup licence/cert', False), (3, 2, 'record', True),
              (2, 4, 'render QR', False), (4, 2, 'QR data-url', True),
              (2, 1, 'valid + details + QR', True), (1, 0, 'show authenticity', True)])


def d_seq_integration():
    sequence('seq_integration.png', 'Figure 15 — Sequence: External Integration Invocation',
             ['Officer', 'API', 'Integrations', 'Adapter', 'Audit'],
             [(0, 1, 'invoke (system, payload)', False), (1, 2, 'route to adapter', False),
              (2, 3, 'call external API (sim)', False), (3, 2, 'response + latency', True),
              (2, 4, 'log call', False), (2, 1, 'result', True), (1, 0, 'display response', True)])


def d_tech_stack():
    c = Canvas(13, 9, 'Figure 16 — Technology Stack')
    rows = [('Frontend', ['React 18', 'Vite', 'TypeScript', 'TailwindCSS', 'Recharts', 'TanStack Query'], LIGHT2),
            ('Backend', ['NestJS 10', 'TypeScript', 'TypeORM', 'Passport/JWT', 'Swagger/OpenAPI', 'class-validator'], LIGHT),
            ('Data', ['SQLite (dev)', 'PostgreSQL (prod)', 'simple-json cols', 'UUID PKs'], '#bcd2ee'),
            ('Tooling', ['pnpm workspaces', 'Jest', 'ESLint 9', 'Docker', 'qrcode', 'faker (seed)'], LIGHT2)]
    y = 80
    for name, items, fc in rows:
        c.box(6, y, 16, 12, name, fc=NAVY, tc='white', fs=11, bold=True)
        for i, it in enumerate(items):
            c.box(26 + (i % 3) * 23, y + 6 - (i // 3) * 6, 22, 5, it, fc=fc, fs=8.5)
        y -= 20
    c.save('tech_stack.png')


def d_security():
    c = Canvas(13, 9, 'Figure 17 — Security: Defense in Depth')
    layers = [('Transport — HTTPS/TLS at proxy', 80, LIGHT2),
              ('Identity — JWT, OTP, Aadhaar/DigiLocker (e-KYC)', 66, LIGHT),
              ('Authorization — RBAC (19 roles), @Roles guards, conditional access', 52, '#bcd2ee'),
              ('Application — input validation, SPA-safe routing, CORS', 38, LIGHT),
              ('Audit & Integrity — immutable audit trail, e-sign, versioning', 24, LIGHT2),
              ('Data — encryption at rest (prod), DPDP-aligned minimization', 10, LIGHT)]
    for txt, y, fc in layers:
        c.box(12, y, 76, 11, txt, fc=fc, fs=10, bold=True)
    c.save('security.png')


def d_volumes():
    facts = json.load(open(os.path.join(os.path.dirname(__file__), 'facts.json')))
    data = [('Applications', 5720), ('Application events', 17640), ('Payments', 5251),
            ('Products', 3200), ('Organizations', 2170), ('Supply movements', 2160),
            ('Invoices', 2160), ('Adverse events', 1500), ('Certificates/NOC', 1140),
            ('Lab samples', 1000), ('Licences', 720), ('Tech persons', 720),
            ('Inspections', 640), ('Grievances', 700), ('Trials', 620), ('Labs', 565)]
    data.sort(key=lambda x: x[1])
    fig, ax = plt.subplots(figsize=(12, 8))
    names = [d[0] for d in data]; vals = [d[1] for d in data]
    bars = ax.barh(names, vals, color=NAVY)
    for b, v in zip(bars, vals):
        ax.text(b.get_width() + 80, b.get_y() + b.get_height() / 2, f'{v:,}', va='center', fontsize=9)
    ax.set_title('Figure 18 — Seeded Data Volumes (500+ per flow)', fontsize=14, fontweight='bold', color=NAVY)
    ax.set_xlabel('Record count'); ax.spines[['top', 'right']].set_visible(False)
    fig.tight_layout(); fig.savefig(os.path.join(OUT, 'volumes.png'), dpi=150, facecolor='white'); plt.close(fig)
    print('  wrote volumes.png')


def d_fourplusone():
    c = Canvas(12, 9, 'Figure 19 — 4+1 Architectural View Model')
    c.box(40, 46, 20, 10, 'Scenarios\n(Use Cases)', fc=SAFFRON, tc='white', fs=10, bold=True)
    views = [('Logical View\n(modules, domain)', 10, 78, GREEN), ('Process View\n(workflow, concurrency)', 70, 78, NAVY),
             ('Development View\n(monorepo, packages)', 10, 14, NAVY), ('Physical View\n(deployment)', 70, 14, GREEN)]
    for t, x, y, col in views:
        c.box(x, y, 22, 11, t, fc='white', ec=col, fs=9, bold=True)
        c.arrow(x + 11, y + (0 if y < 50 else 0) + (11 if y < 50 else 0), 50, 51, col)
    c.save('fourplusone.png')


def d_portal_nav():
    c = Canvas(14, 8.5, 'Figure 20 — Portal Navigation Map')
    c.box(42, 80, 16, 8, 'DDRS Login', fc=NAVY, tc='white', fs=10, bold=True)
    mods = ['Dashboard', 'Applications', 'Licences', 'Clinical Trials', 'Inspections', 'Enforcement',
            'Vigilance', 'Laboratory', 'Supply Chain', 'Returns', 'Payments', 'Registries',
            'Products', 'Grievances', 'SHRESTH', 'Analytics', 'Integrations', 'Users', 'Audit', 'Notifications']
    for i, m in enumerate(mods):
        col = i % 5; row = i // 5
        c.box(4 + col * 19, 58 - row * 13, 17, 9, m, fc=LIGHT, fs=8.5)
        c.arrow(50, 80, 4 + col * 19 + 8.5, 58 - row * 13 + 9, GRAY)
    c.save('portal_nav.png')


if __name__ == '__main__':
    print('Generating diagrams...')
    for fn in [d_context, d_layered, d_components, d_deployment, d_er_core, d_er_ops,
               d_dfd_l0, d_dfd_licensing, d_workflow, d_rbac, d_integrations,
               d_seq_application, d_seq_login, d_seq_verify, d_seq_integration,
               d_tech_stack, d_security, d_volumes, d_fourplusone, d_portal_nav]:
        fn()
    print('Done. Images in', OUT)
