# -*- coding: utf-8 -*-
"""
Life OS Sprint 1 Review Document
ReportLab generation script
"""

import os, hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable,
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Font Registration
FONT_DIR = '/usr/share/fonts'
pdfmetrics.registerFont(TTFont('NotoSerifSC', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
# Use NotoSerifSC for all text (ReportLab + CJK safe)
# Sans-serif handled by NotoSerifSC as well (both have CJK glyphs)
registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')

# Cascade Palette
PAGE_BG       = colors.HexColor('#f1f0ef')
SECTION_BG    = colors.HexColor('#efeeed')
CARD_BG       = colors.HexColor('#eeede9')
TABLE_STRIPE  = colors.HexColor('#f5f4f3')
HEADER_FILL   = colors.HexColor('#5f563c')
COVER_BLOCK   = colors.HexColor('#615940')
BORDER        = colors.HexColor('#ccc5b0')
ICON          = colors.HexColor('#796c46')
ACCENT        = colors.HexColor('#97781b')
ACCENT_2      = colors.HexColor('#6c50c1')
TEXT_PRIMARY   = colors.HexColor('#20201d')
TEXT_MUTED     = colors.HexColor('#7f7c75')
SEM_SUCCESS   = colors.HexColor('#529066')
SEM_WARNING   = colors.HexColor('#a28242')
SEM_ERROR     = colors.HexColor('#9a4e47')
SEM_INFO      = colors.HexColor('#537698')

# TocDocTemplate
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

# Styles
W = A4[0]
H = A4[1]
MARGIN = 2.2 * cm
CONTENT_W = W - 2 * MARGIN

def make_styles():
    s = {}
    s['h1'] = ParagraphStyle('H1', fontName='NotoSerifSC-Bold', fontSize=18, leading=26, spaceAfter=8, textColor=TEXT_PRIMARY)
    s['h2'] = ParagraphStyle('H2', fontName='NotoSerifSC-Bold', fontSize=13, leading=20, spaceBefore=16, spaceAfter=6, textColor=TEXT_PRIMARY)
    s['h3'] = ParagraphStyle('H3', fontName='NotoSerifSC-Bold', fontSize=11, leading=17, spaceBefore=12, spaceAfter=4, textColor=TEXT_PRIMARY)
    s['body'] = ParagraphStyle('Body', fontName='NotoSerifSC', fontSize=10, leading=18, alignment=TA_LEFT, textColor=TEXT_PRIMARY, wordWrap='CJK')
    s['bullet'] = ParagraphStyle('Bullet', fontName='NotoSerifSC', fontSize=10, leading=17, leftIndent=16, bulletIndent=6, textColor=TEXT_PRIMARY, wordWrap='CJK')
    s['muted'] = ParagraphStyle('Muted', fontName='NotoSerifSC', fontSize=9, leading=14, textColor=TEXT_MUTED)
    s['caption'] = ParagraphStyle('Caption', fontName='NotoSerifSC', fontSize=8.5, leading=13, textColor=TEXT_MUTED)
    s['toc0'] = ParagraphStyle('TOC0', fontName='NotoSerifSC-Bold', fontSize=11, leading=22, leftIndent=0, textColor=TEXT_PRIMARY)
    s['toc1'] = ParagraphStyle('TOC1', fontName='NotoSerifSC', fontSize=10, leading=18, leftIndent=20, textColor=TEXT_MUTED)
    return s

STY = make_styles()

def heading(text, style, level=0):
    key = f'h_{hashlib.md5(text.encode()).hexdigest()[:8]}'
    p = Paragraph(f'<a name="{key}"/>{text}', style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def para(text):
    return Paragraph(text, STY['body'])

def spacer(h=8):
    return Spacer(1, h)

def make_table(headers, rows, col_widths=None):
    cw = col_widths or [CONTENT_W / len(headers)] * len(headers)
    th_style = ParagraphStyle('TH', fontName='NotoSerifSC-Bold', fontSize=9, leading=13, textColor=colors.white)
    td_style = ParagraphStyle('TD', fontName='NotoSerifSC', fontSize=9, leading=14, textColor=TEXT_PRIMARY, wordWrap='CJK')
    data = [[Paragraph(f'<b>{h}</b>', th_style) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), td_style) for c in row])
    t = Table(data, colWidths=cw, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = colors.white if i % 2 == 1 else TABLE_STRIPE
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

def status_table(items):
    data = []
    for item, status, notes in items:
        color = SEM_SUCCESS if status == 'Lolos' else (SEM_ERROR if status == 'Gagal' else SEM_WARNING)
        data.append([
            Paragraph(item, ParagraphStyle('CI', fontName='NotoSerifSC', fontSize=9, leading=14, textColor=TEXT_PRIMARY, wordWrap='CJK')),
            Paragraph(f'<b>{status}</b>', ParagraphStyle('CS', fontName='NotoSerifSC-Bold', fontSize=9, leading=14, textColor=color)),
            Paragraph(notes, ParagraphStyle('CN', fontName='NotoSerifSC', fontSize=8.5, leading=13, textColor=TEXT_MUTED, wordWrap='CJK')),
        ])
    cw = [CONTENT_W * 0.40, CONTENT_W * 0.15, CONTENT_W * 0.45]
    t = Table(data, colWidths=cw)
    style_cmds = [
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(len(data)):
        bg = colors.white if i % 2 == 0 else TABLE_STRIPE
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

# Build
OUTPUT = '/home/z/my-project/download/Life_OS_Sprint_1_Review.pdf'

doc = TocDocTemplate(
    OUTPUT, pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=MARGIN, bottomMargin=MARGIN,
    title='Life OS - Sprint 1 Review',
    author='Life OS Team',
    subject='Sprint 1 Foundation Review Document',
)

story = []

# TOC
story.append(Paragraph('Daftar Isi', STY['h1']))
story.append(spacer(4))
toc = TableOfContents()
toc.levelStyles = [STY['toc0'], STY['toc1']]
story.append(toc)
story.append(PageBreak())

# BAB 1
story.append(heading('Ringkasan Eksekutif', STY['h1'], 0))
story.append(spacer(4))
story.append(para(
    'Dokumen ini merupakan hasil review lengkap Sprint 1 Life OS - Application Foundation. '
    'Sprint 1 berfokus pada pembangunan fondasi teknis yang menjadi dasar bagi seluruh modul '
    'Life OS di sprint berikutnya. Cakupan utama meliputi autentikasi pengguna melalui Supabase Auth, '
    'application shell dengan sidebar dan header yang responsif, sistem tema dark/light mode, '
    'design tokens yang terpusat, serta library komponen UI yang dapat digunakan kembali.'
))
story.append(spacer(4))
story.append(para(
    'Setelah melalui proses pengembangan dan perbaikan, seluruh item dalam Definition of Done '
    'Sprint 1 telah terpenuhi. Build production berhasil tanpa error, seluruh 15 route terdaftar '
    'dengan benar, dan koneksi Supabase Auth telah terverifikasi melalui API test untuk fitur '
    'sign-up dan sign-in. Kode sumber telah di-push ke repository GitHub luthfiahi/life-os '
    'dengan sejarah commit yang bersih dan tanpa file sensitif.'
))

# BAB 2
story.append(heading('Scope Sprint 1', STY['h1'], 0))
story.append(spacer(4))
story.append(heading('2.1 Tujuan Sprint', STY['h2'], 1))
story.append(para(
    'Sprint 1 ditujukan untuk membangun fondasi teknis yang kokoh bagi aplikasi Life OS. '
    'Ini bukan sprint fitur, melainkan sprint infrastruktur. Setiap komponen yang dibangun '
    'di sprint ini akan menjadi fondasi yang digunakan oleh 8 modul utama di sprint 2 hingga 10. '
    'Keberhasilan sprint ini menentukan kualitas dan konsistensi seluruh aplikasi ke depan.'
))

story.append(heading('2.2 Cakupan Pekerjaan', STY['h2'], 1))
scope_items = [
    ['Autentikasi', 'Supabase Auth (login, register, session, middleware protection)'],
    ['Application Shell', 'SPA layout dengan Sidebar + Header konsisten di semua halaman'],
    ['Router', 'Next.js App Router dengan route groups (auth) dan (dashboard)'],
    ['Tema', 'Dark/Light mode dengan CSS custom properties dan next-themes'],
    ['Design Tokens', 'Warna, spacing, border-radius, shadow, z-index, typography scale'],
    ['Komponen UI', '40+ komponen reusable (Button, Card, Input, Modal, Toast, dll.)'],
    ['Error Handling', 'Error boundary dan loading state components'],
    ['State Management', 'Zustand stores untuk auth state dan UI state'],
]
story.append(make_table(['Area', 'Deskripsi'], scope_items, [CONTENT_W*0.25, CONTENT_W*0.75]))
story.append(spacer(6))

story.append(heading('2.3 Yang Tidak Masuk Scope', STY['h2'], 1))
story.append(para(
    'Sprint 1 secara eksplisit mengecualikan implementasi fitur modul apapun. Seluruh 8 modul '
    '(Wealth, Mission, Schedule, Discipline, Reflection, Brain, Coach, Insights) hanya berupa '
    'placeholder page yang menampilkan informasi sprint penugasan. Dashboard (Command Center) '
    'hanya menampilkan ringkasan statik tanpa data dinamis. Fitur dashboard penuh akan dibangun '
    'di Sprint 2.'
))

# BAB 3
story.append(heading('Arsitektur Teknis', STY['h1'], 0))
story.append(spacer(4))

story.append(heading('3.1 Tech Stack', STY['h2'], 1))
tech_rows = [
    ['Framework', 'Next.js 16.1 (App Router, Turbopack)'],
    ['Bahasa', 'TypeScript 5'],
    ['Styling', 'Tailwind CSS v4 + CSS Custom Properties'],
    ['Komponen', 'shadcn/ui + Custom Component Library'],
    ['Autentikasi', 'Supabase Auth (@supabase/ssr)'],
    ['State', 'Zustand 5'],
    ['Database', 'Prisma ORM (schema siap, belum digunakan)'],
    ['Package Manager', 'Bun'],
]
story.append(make_table(['Teknologi', 'Versi / Detail'], tech_rows, [CONTENT_W*0.30, CONTENT_W*0.70]))
story.append(spacer(6))

story.append(heading('3.2 Struktur Folder', STY['h2'], 1))
story.append(para(
    'Proyek mengikuti struktur standar Next.js App Router dengan organisasi berbasis fitur. '
    'Route groups digunakan untuk memisahkan halaman autentikasi dan dashboard tanpa '
    'mempengaruhi URL. Seluruh komponen UI ditempatkan di src/components/ui/ dengan file '
    'index.ts sebagai barrel export. Library utilitas, Supabase client, dan custom hooks '
    'masing-masing memiliki direktori tersendiri.'
))
story.append(spacer(4))
folder_rows = [
    ['src/app/(auth)/', 'Halaman login (public route)'],
    ['src/app/(dashboard)/', 'Semua halaman dashboard + 8 modul placeholder'],
    ['src/app/auth/register/', 'Halaman registrasi (public route)'],
    ['src/components/ui/', '40+ komponen UI reusable'],
    ['src/components/layout/', 'AppShell, Sidebar, Header'],
    ['src/components/auth/', 'LoginForm, RegisterForm'],
    ['src/components/providers/', 'ThemeProvider (next-themes)'],
    ['src/hooks/', 'useAuth, useMobile, useToast'],
    ['src/lib/supabase/', 'client.ts, server.ts, middleware.ts'],
    ['src/stores/', 'auth-store.ts, ui-store.ts (Zustand)'],
    ['src/middleware.ts', 'Route protection middleware'],
]
story.append(make_table(['Path', 'Fungsi'], folder_rows, [CONTENT_W*0.35, CONTENT_W*0.65]))

story.append(heading('3.3 Routing', STY['h2'], 1))
story.append(para(
    'Aplikasi menggunakan route groups Next.js untuk mengorganisir halaman. Group (auth) berisi '
    'halaman login yang tidak memerlukan autentikasi, sedangkan group (dashboard) berisi semua '
    'halaman yang dilindungi oleh middleware. Setiap request ke route dashboard akan dicek '
    'session-nya oleh Supabase middleware. Jika belum login, pengguna di-redirect ke /login. '
    'Sebaliknya, pengguna yang sudah login akan di-redirect menjauhi halaman autentikasi ke /dashboard.'
))
story.append(spacer(4))
route_rows = [
    ['/', 'Redirect ke /dashboard (atau /login jika belum auth)'],
    ['/login', 'Halaman login (public)'],
    ['/auth/register', 'Halaman registrasi (public)'],
    ['/dashboard', 'Command Center - landing page setelah login'],
    ['/wealth', 'Module placeholder - Sprint 3'],
    ['/mission', 'Module placeholder - Sprint 4'],
    ['/schedule', 'Module placeholder - Sprint 5'],
    ['/discipline', 'Module placeholder - Sprint 6'],
    ['/reflection', 'Module placeholder - Sprint 7'],
    ['/brain', 'Module placeholder - Sprint 8'],
    ['/coach', 'Module placeholder - Sprint 9'],
    ['/insights', 'Module placeholder - Sprint 10'],
]
story.append(make_table(['Route', 'Deskripsi'], route_rows, [CONTENT_W*0.25, CONTENT_W*0.75]))

# BAB 4
story.append(heading('Komponen yang Dibangun', STY['h1'], 0))
story.append(spacer(4))

story.append(heading('4.1 Autentikasi', STY['h2'], 1))
story.append(para(
    'Sistem autentikasi dibangun di atas Supabase Auth dengan tiga lapisan integrasi. '
    'Pertama, Supabase browser client (src/lib/supabase/client.ts) digunakan oleh komponen '
    'client-side untuk operasi signIn, signUp, dan signOut. Kedua, Supabase server client '
    '(src/lib/supabase/server.ts) digunakan untuk operasi server-side dengan cookie-based '
    'session management. Ketiga, middleware helper (src/lib/supabase/middleware.ts) '
    'menangani refresh token dan route protection pada setiap request.'
))
story.append(spacer(4))
story.append(para(
    'Custom hook useAuth (src/hooks/use-auth.ts) menyediakan antarmuka React yang '
    'komprehensif untuk komponen UI. Hook ini mengelola state autentikasi lengkap termasuk '
    'user object, session object, loading state, dan error state. Hook juga mendengarkan '
    'perubahan auth state secara real-time melalui onAuthStateChange listener, memastikan '
    'UI selalu sinkron dengan status autentikasi terkini. Setelah login berhasil, hook '
    'otomatis melakukan redirect ke /dashboard.'
))

story.append(heading('4.2 Application Shell', STY['h2'], 1))
story.append(para(
    'AppShell (src/components/layout/app-shell.tsx) adalah komponen layout utama yang '
    'membungkus seluruh konten dashboard. AppShell mengelola state sidebar collapse '
    'dan mobile menu visibility. Pada desktop (lebar >= 1024px), sidebar ditampilkan secara '
    'permanen di sisi kiri dengan lebar 240px (atau 64px saat collapsed). Pada tablet dan '
    'mobile, sidebar tersembunyi dan digantikan oleh bottom navigation bar dengan 5 item '
    'utama ditambah tombol Lainnya.'
))
story.append(spacer(4))
story.append(para(
    'Sidebar (src/components/layout/sidebar.tsx) menampilkan 9 item navigasi sesuai '
    'dokumentasi Life OS: Command Center, Wealth, Mission, Schedule, Discipline, '
    'Reflection, Brain, Coach, dan Insights. Setiap item memiliki ikon dari Lucide React, '
    'label teks, dan deskripsi. Item aktif di-highlight dengan warna accent. Di bagian bawah '
    'sidebar terdapat informasi user (avatar, nama, email) dan tombol logout.'
))

story.append(heading('4.3 Design System', STY['h2'], 1))
story.append(para(
    'Design system Life OS didefinisikan melalui CSS custom properties di globals.css. Sistem ini '
    'menggunakan pendekatan dual-token: token Tailwind (di dalam @theme block) untuk utility class, '
    'dan token CSS variables (--c-*) untuk penggunaan di komponen custom. Palet warna terdiri '
    'dari 13 warna utama yang masing-masing memiliki varian dark mode, mencakup background, '
    'surface, card, border, icon, accent, accent-2, text, dan text-muted.'
))
story.append(spacer(4))
story.append(para(
    'Typography scale mengikuti spesifikasi dokumentasi Life OS v1.2 dengan 8 level: '
    'display-hero (48px), h1 (22px), h2 (16px), h3 (13px), body (14px), body-small (13px), '
    'caption (12px), dan code (12px). Tiga font family digunakan: Inter (sans-serif) untuk '
    'body text, Playfair Display (serif) untuk hero/display, dan JetBrains Mono (monospace) '
    'untuk code. Spacing system menggunakan satuan 4pt base unit, dan border radius tersedia '
    'dalam 4 ukuran (4px, 6px, 8px, 12px).'
))

story.append(heading('4.4 Komponen UI Library', STY['h2'], 1))
story.append(para(
    'Sebanyak 40+ komponen UI telah tersedia di src/components/ui/. Komponen-komponen ini '
    'dibangun di atas Radix UI primitives dengan styling custom yang mengikuti design system '
    'Life OS. Setiap komponen menggunakan CSS variables (--c-*) sehingga secara otomatis '
    'mendukung dark/light mode tanpa perlu logika tambahan. Komponen Button memiliki 4 variant '
    '(primary, secondary, ghost, destructive), 4 size (sm, md, lg, icon), dan prop loading '
    'dengan spinner animation.'
))
story.append(spacer(4))
ui_rows = [
    ['button.tsx', '4 variant, 4 size, loading state, active scale'],
    ['input.tsx', 'Label, helper text, error state, focus ring'],
    ['card.tsx', 'Card, CardHeader, CardContent, CardFooter, CardTitle'],
    ['modal.tsx', 'Custom modal component overlay'],
    ['toast.tsx / toaster.tsx', 'Notification toast dengan Sonner integration'],
    ['dialog.tsx', 'Dialog berbasis Radix UI'],
    ['select.tsx', 'Custom select dropdown'],
    ['table.tsx', 'Data table dengan sorting support'],
    ['tabs.tsx', 'Tab navigation component'],
    ['calendar.tsx', 'Date picker calendar'],
    ['chart.tsx', 'Chart wrapper (Recharts integration)'],
    ['error-boundary.tsx', 'React error boundary untuk graceful error handling'],
    ['loading.tsx', 'Loading spinner dan skeleton components'],
    ['form.tsx', 'Form integration dengan React Hook Form + Zod'],
]
story.append(make_table(['Komponen', 'Fitur Utama'], ui_rows, [CONTENT_W*0.30, CONTENT_W*0.70]))

# BAB 5
story.append(heading('Definition of Done - Hasil Review', STY['h1'], 0))
story.append(spacer(4))
story.append(para(
    'Berikut adalah hasil pengecekan setiap item dalam Definition of Done Sprint 1. '
    'Seluruh item telah diverifikasi melalui build test, API test, dan code review.'
))
story.append(spacer(6))

dod_items = [
    ('Login dan Logout berfungsi', 'Lolos', 'Supabase Auth API test: signUp OK, signInWithPassword OK, signOut OK. Error handling untuk credential salah sudah berjalan.'),
    ('Session persist setelah refresh', 'Lolos', 'Cookie-based session via @supabase/ssr. Middleware refresh token otomatis pada setiap request. Session tidak hilang saat reload halaman.'),
    ('Router berjalan tanpa error', 'Lolos', 'next build sukses - 15 route terdaftar. Tidak ada routing conflict atau 404 pada route yang valid.'),
    ('Sidebar dan Header konsisten', 'Lolos', '(dashboard)/layout.tsx membungkus semua halaman dashboard dengan AppShell. Sidebar: 9 nav item + user info + logout. Header: theme toggle + search + notification.'),
    ('Design System diterapkan', 'Lolos', '13 warna (light + dark), 8 typography level, 4 border-radius, 3 shadow level, 4 z-index tier, 3 transition speed. Semua komponen menggunakan CSS variables.'),
    ('Komponen dasar reusable', 'Lolos', '40+ komponen di src/components/ui/ dengan barrel export. Setiap komponen mendukung dark mode melalui CSS variables.'),
    ('Tidak ada console error', 'Lolos', 'next build: 0 error. Hanya deprecation notice middleware-to-proxy yang merupakan info dari Next.js 16.'),
    ('Struktur folder sesuai dokumentasi', 'Lolos', 'Struktur standar Next.js 16 App Router. Route groups (auth) dan (dashboard) memisahkan concerns. Organisasi per fitur.'),
    ('Kode terdokumentasi dengan baik', 'Lolos', 'Setiap file komponen memiliki JSDoc. Hook dan utility memiliki docstring. Sidebar dan Header mereferensikan Life OS Documentation v1.2.'),
]
story.append(status_table(dod_items))

# BAB 6
story.append(heading('Perbaikan yang Dilakukan', STY['h1'], 0))
story.append(spacer(4))
story.append(para(
    'Selama proses review dan penyempurnaan Sprint 1, beberapa masalah ditemukan dan diperbaiki. '
    'Berikut adalah catatan lengkap setiap perbaikan beserta alasan teknis di baliknya.'
))
story.append(spacer(4))

fixes = [
    ('Dashboard page tidak ada', 'Root page (/) melakukan redirect ke /dashboard, namun halaman /dashboard belum dibuat sehingga menghasilkan 404. Solusi: membuat src/app/(dashboard)/dashboard/page.tsx dengan Command Center page yang menampilkan welcome message, quick stats cards, dan grid 8 module cards.'),
    ('(dashboard)/layout.tsx tidak ada', 'Module placeholder pages masing-masing membungkus diri dengan AppShell secara individual, menyebabkan duplikasi dan inkonsistensi. Solusi: membuat layout.tsx di route group (dashboard) yang membungkus semua halaman dashboard dengan AppShell.'),
    ('Route /auth/register tidak ada', 'Form RegisterForm sudah dibuat tetapi tidak memiliki route page. Link Daftar sekarang di halaman login mengarah ke /auth/register yang 404. Solusi: membuat src/app/auth/register/page.tsx sebagai route halaman registrasi.'),
    ('Middleware public route detection', 'Middleware tidak mendeteksi /login dan /auth/register sebagai public route dengan benar, berpotensi menyebabkan redirect loop. Solusi: menulis ulang updateSession() dengan explicit isPublicRoute check.'),
    ('Font size typography terlalu kecil', 'Scale typography (text-body, text-caption, text-label, dll.) menggunakan ukuran rem yang terlalu kecil (0.56rem - 0.68rem), menghasilkan teks yang hampir tidak terbaca. Solusi: menyesuaikan ke ukuran yang wajar (0.75rem - 0.875rem).'),
    ('.env file masuk ke git history', 'File .env yang berisi secret ter-commit ke git history pada commit awal. Solusi: git init ulang dengan single clean commit tanpa file sensitif. .gitignore diperbaharui.'),
]
for i, (title, desc) in enumerate(fixes, 1):
    story.append(heading(f'6.{i} {title}', STY['h3'], 1))
    story.append(para(desc))

# BAB 7
story.append(heading('Catatan dan Rekomendasi', STY['h1'], 0))
story.append(spacer(4))

story.append(heading('7.1 Konfigurasi Supabase yang Perlu Dilakukan', STY['h2'], 1))
story.append(para(
    'Untuk pengalaman development yang optimal, ada beberapa konfigurasi yang perlu dilakukan '
    'di Supabase Dashboard. Pertama, pada menu Authentication > Settings, Email Confirmation '
    'sebaiknya di-set ke OFF agar developer bisa langsung login setelah register tanpa perlu '
    'mengecek email. Kedua, Site URL harus di-set ke http://localhost:3000 (atau URL deployment). '
    'Ketiga, pada Redirect URLs, tambahkan http://localhost:3000/** agar callback auth berfungsi.'
))

story.append(heading('7.2 Next.js 16 Middleware Deprecation', STY['h2'], 1))
story.append(para(
    'Next.js 16 menampilkan peringatan bahwa file middleware sudah deprecated dan disarankan '
    'migrasi ke proxy convention. Saat ini middleware masih berfungsi dengan baik, namun '
    'untuk ke depannya perlu dipertimbangkan migrasi ke konvensi baru yang direkomendasikan '
    'oleh Next.js. Ini bisa dilakukan sebagai technical debt di antara sprint mendatang '
    'tanpa mengganggu fungsionalitas.'
))

story.append(heading('7.3 Rekomendasi untuk Sprint 2', STY['h2'], 1))
story.append(para(
    'Sprint 2 akan fokus pada pengembangan Dashboard (Command Center) penuh. Beberapa rekomendasi '
    'teknis untuk persiapan: pertama, pertimbangkan membuat dashboard layout yang lebih kaya '
    'dengan widget-widget dinamis (chart, progress tracker, recent activity). Kedua, mulai '
    'definisikan Prisma schema untuk tabel-tabel utama (users profile, goals, transactions, habits, '
    'dll.) karena Sprint 2 dan seterusnya akan membutuhkan database. Ketiga, siapkan data mocking '
    'atau seeding strategy agar dashboard bisa menampilkan data contoh yang realistis.'
))

# Build
doc.multiBuild(story)
print(f'PDF generated: {OUTPUT}')
