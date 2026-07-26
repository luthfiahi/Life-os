"""
Life OS Sprint 4: Wealth CRUD - Ringkasan PDF
ReportLab-based 4-page PDF document
"""

import sys, os
PDF_SKILL_DIR = "/home/z/my-project/skills/pdf"
_scripts = os.path.join(PDF_SKILL_DIR, "scripts")
if _scripts not in sys.path:
    sys.path.insert(0, _scripts)

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable,
)
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import pypdf

# ━━ Cascade Palette (auto-generated) ━━
PAGE_BG       = colors.HexColor('#f5f5f5')
SECTION_BG    = colors.HexColor('#edecea')
CARD_BG       = colors.HexColor('#ecebe9')
TABLE_STRIPE  = colors.HexColor('#eeedeb')
HEADER_FILL   = colors.HexColor('#675d3e')
COVER_BLOCK   = colors.HexColor('#766a47')
BORDER        = colors.HexColor('#bfbaab')
ICON          = colors.HexColor('#796b40')
ACCENT        = colors.HexColor('#96771c')
ACCENT_2      = colors.HexColor('#4fb1d1')
TEXT_PRIMARY   = colors.HexColor('#272623')
TEXT_MUTED     = colors.HexColor('#84817a')
SEM_SUCCESS   = colors.HexColor('#49825c')
SEM_WARNING   = colors.HexColor('#b38f47')
SEM_ERROR     = colors.HexColor('#ad4b42')

# ━━ Font Registration ━━
pdfmetrics.registerFont(TTFont('NotoSansSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSansSC-Bold', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))

# Font fallback for CJK
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('NotoSansSC', normal='NotoSansSC', bold='NotoSansSC-Bold')
registerFontFamily('FreeSerif', normal='FreeSerif')
registerFontFamily('FreeSans', normal='FreeSans')

# ━━ Output paths ━━
OUTPUT_DIR = '/home/z/my-project/download'
os.makedirs(OUTPUT_DIR, exist_ok=True)
BODY_PDF = os.path.join(OUTPUT_DIR, 'sprint4-wealth-crud-body.pdf')
COVER_HTML = os.path.join(OUTPUT_DIR, 'sprint4-cover.html')
COVER_PDF = os.path.join(OUTPUT_DIR, 'sprint4-cover.pdf')
FINAL_PDF = os.path.join(OUTPUT_DIR, 'Life-OS-Sprint-4-Wealth-CRUD.pdf')

# ━━ Styles ━━
W, H = A4

style_h1 = ParagraphStyle(
    name='H1', fontName='NotoSansSC-Bold', fontSize=18, leading=26,
    textColor=TEXT_PRIMARY, spaceAfter=8, spaceBefore=16,
)
style_h2 = ParagraphStyle(
    name='H2', fontName='NotoSansSC-Bold', fontSize=13, leading=19,
    textColor=HEADER_FILL, spaceAfter=6, spaceBefore=12,
)
style_body = ParagraphStyle(
    name='Body', fontName='NotoSansSC', fontSize=10, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK',
)
style_body_justify = ParagraphStyle(
    name='BodyJustify', fontName='NotoSansSC', fontSize=10, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, wordWrap='CJK',
)
style_bullet = ParagraphStyle(
    name='Bullet', fontName='NotoSansSC', fontSize=10, leading=17,
    textColor=TEXT_PRIMARY, leftIndent=16, bulletIndent=4,
    wordWrap='CJK',
)
style_meta = ParagraphStyle(
    name='Meta', fontName='NotoSansSC', fontSize=8, leading=12,
    textColor=TEXT_MUTED, alignment=TA_LEFT,
)
style_table_header = ParagraphStyle(
    name='TableHeader', fontName='NotoSansSC-Bold', fontSize=9, leading=13,
    textColor=colors.white, alignment=TA_CENTER,
)
style_table_cell = ParagraphStyle(
    name='TableCell', fontName='NotoSansSC', fontSize=9, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK',
)
style_callout = ParagraphStyle(
    name='Callout', fontName='NotoSansSC-Bold', fontSize=22, leading=28,
    textColor=ACCENT, alignment=TA_CENTER,
)
style_callout_label = ParagraphStyle(
    name='CalloutLabel', fontName='NotoSansSC', fontSize=9, leading=13,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceAfter=2,
)

# ━━ Helper ━━
def hr():
    return HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=8, spaceBefore=8)

def bullet(text):
    return Paragraph(f"\u2022  {text}", style_bullet)

def callout_block(number, label):
    return [
        Paragraph(label, style_callout_label),
        Paragraph(number, style_callout),
        Spacer(1, 6),
    ]

# ━━ Build Body Content ━━
story = []

# === Section 1: Ringkasan Eksekutif ===
story.append(Paragraph('<b>1. Ringkasan Eksekutif</b>', style_h1))
story.append(hr())
story.append(Paragraph(
    'Sprint 4 menyelesaikan implementasi penuh modul Wealth (Keuangan) pada aplikasi Life OS. '
    'Modul ini mencakup seluruh operasi CRUD (Create, Read, Update, Delete) untuk tiga entitas utama: '
    'Akun Keuangan, Transaksi, dan Budget. Seluruh fitur terhubung langsung ke database Supabase '
    'melalui arsitektur berlapis yang sudah dibangun di Sprint 3, sehingga data yang ditampilkan '
    'di dashboard ter-update secara otomatis setiap kali ada perubahan.',
    style_body_justify,
))
story.append(Spacer(1, 6))

# Stats callouts
stats_data = [
    [Paragraph('<b>14</b>', ParagraphStyle('s1', fontName='NotoSansSC-Bold', fontSize=20, leading=24, textColor=ACCENT, alignment=TA_CENTER)),
     Paragraph('<b>7</b>', ParagraphStyle('s2', fontName='NotoSansSC-Bold', fontSize=20, leading=24, textColor=ACCENT, alignment=TA_CENTER)),
     Paragraph('<b>6</b>', ParagraphStyle('s3', fontName='NotoSansSC-Bold', fontSize=20, leading=24, textColor=ACCENT, alignment=TA_CENTER)),
     Paragraph('<b>1.827</b>', ParagraphStyle('s4', fontName='NotoSansSC-Bold', fontSize=20, leading=24, textColor=ACCENT, alignment=TA_CENTER))],
    [Paragraph('File Dibuat / Diubah', style_meta),
     Paragraph('Komponen Baru', style_meta),
     Paragraph('Query Hooks Baru', style_meta),
     Paragraph('Baris Kode', style_meta)],
]
stats_table = Table(stats_data, colWidths=[W*0.22]*4)
stats_table.setStyle(TableStyle([
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, 0), 12),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 2),
    ('TOPPADDING', (0, 1), (-1, 1), 0),
    ('BOTTOMPADDING', (0, 1), (-1, 1), 8),
    ('BACKGROUND', (0, 0), (-1, -1), CARD_BG),
    ('BOX', (0, 0), (-1, -1), 0.5, BORDER),
    ('LINEBELOW', (0, 0), (-1, 0), 0.5, BORDER),
]))
story.append(stats_table)
story.append(Spacer(1, 8))

story.append(Paragraph(
    'Stack teknologi yang digunakan pada Sprint 4 meliputi react-hook-form untuk manajemen form state, '
    'zod untuk validasi skema data di sisi klien, serta TanStack Query untuk pengelolaan server state '
    'dan cache invalidation. Seluruh mutasi (create, update, delete) secara otomatis me-refresh '
    'cache dashboard snapshot melalui fungsi invalidateWealthQueries, sehingga widget keuangan di '
    'halaman utama selalu menampilkan data terkini tanpa perlu reload halaman secara manual.',
    style_body_justify,
))

# === Section 2: Fitur yang Dibangun ===
story.append(Spacer(1, 4))
story.append(Paragraph('<b>2. Fitur yang Dibangun</b>', style_h1))
story.append(hr())

# 2.1 Daftar Akun
story.append(Paragraph('<b>2.1 Daftar Akun Keuangan</b>', style_h2))
story.append(Paragraph(
    'Halaman /wealth/accounts menampilkan seluruh akun keuangan pengguna dalam layout grid responsif '
    '(1 kolom di mobile, 2-3 kolom di tablet dan desktop). Setiap akun ditampilkan dalam card yang '
    'menunjukkan nama akun, tipe (Bank, Tunai, E-Wallet, Investasi), saldo terkini dalam format '
    'Rupiah, dan status aktif/non-aktif. Tipe akun dibedakan dengan ikon dan badge warna yang berbeda: '
    'biru untuk Bank, hijau untuk Tunai, ungu untuk E-Wallet, dan amber untuk Investasi. '
    'Pengguna dapat menambahkan akun baru, mengedit detail akun yang sudah ada (nama, tipe, saldo, warna), '
    'dan menghapus akun melalui dropdown menu aksi di setiap card. Total saldo dari seluruh akun aktif '
    'ditampilkan di bagian header halaman sebagai ringkasan cepat.',
    style_body_justify,
))

# 2.2 Daftar Transaksi
story.append(Paragraph('<b>2.2 Daftar Transaksi</b>', style_h2))
story.append(Paragraph(
    'Halaman /wealth/transactions menampilkan riwayat seluruh transaksi pengguna yang dikelompokkan '
    'berdasarkan tanggal (Hari Ini, Kemarin, atau format tanggal lengkap). Setiap item transaksi '
    'menampilkan ikon panah hijau (pemasukan) atau merah (pengeluaran), deskripsi, nama kategori, '
    'nama akun sumber, tanggal, dan jumlah dalam format Rupiah. Terdapat dua filter utama: filter '
    'berdasarkan tipe (Semua, Pemasukan, Pengeluaran) dan filter berdasarkan akun, yang memudahkan '
    'pengguna menemukan transaksi tertentu. Di bagian atas halaman terdapat ringkasan total pemasukan '
    'dan pengeluaran dari transaksi yang terfilter, memberikan gambaran keuangan secara sekilas.',
    style_body_justify,
))

# 2.3 Form Transaksi
story.append(Paragraph('<b>2.3 Tambah, Edit, dan Hapus Transaksi</b>', style_h2))
story.append(Paragraph(
    'Form transaksi diimplementasikan sebagai dialog modal yang mendukung pembuatan dan pengeditan '
    'transaksi dalam satu komponen yang sama. Form ini menggunakan react-hook-form untuk manajemen '
    'state dan zod untuk validasi data dengan skema yang ketat: tipe transaksi wajib dipilih, '
    'akun wajib dipilih, kategori wajib dipilih, jumlah harus lebih dari 0, dan deskripsi wajib diisi. '
    'Terdapat toggle visual untuk memilih antara Pengeluaran dan Pemasukan yang mengubah warna tema form '
    'secara dinamis. Fitur quick-add kategori memungkinkan pengguna membuat kategori baru langsung dari form '
    'transaksi tanpa harus meninggalkan halaman. Saldo akun yang dipilih ditampilkan sebagai referensi '
    'saat memasukkan jumlah. Setiap transaksi yang dihapus memerlukan konfirmasi melalui dialog terpisah '
    'untuk mencegah penghapusan tidak disengaja.',
    style_body_justify,
))

# 2.4 Budget Management
story.append(Paragraph('<b>2.4 Budget Management</b>', style_h2))
story.append(Paragraph(
    'Halaman /wealth/budgets menyediakan fitur pelacakan budget pengeluaran per kategori. Setiap budget '
    'ditampilkan dalam card yang memuat nama kategori, progress bar persentase penggunaan, jumlah '
    'budget yang ditetapkan, jumlah yang sudah terpakai, dan sisa budget. Warna progress bar berubah secara '
    'adaptif berdasarkan tingkat penggunaan: hijau (teal) untuk di bawah 60%, amber untuk 60-85%, dan '
    'merah untuk di atas 85%, memberikan peringatan visual yang intuitif kepada pengguna. Navigator bulan '
    'memungkinkan pengguna melihat data budget pada bulan sebelumnya atau mendatang. Tiga kartu ringkasan '
    'di bagian atas menampilkan Total Budget, Total Terpakai, dan Rata-rata Persentase Terpakai secara keseluruhan.',
    style_body_justify,
))

# 2.5 Dashboard Auto-Update
story.append(Paragraph('<b>2.5 Dashboard Auto-Update</b>', style_h2))
story.append(Paragraph(
    'Setiap operasi mutasi (create, update, delete) pada akun, transaksi, atau budget secara otomatis '
    'me-invalidate cache TanStack Query yang relevan, termasuk cache snapshot dashboard. Hal ini dicapai '
    'melalui fungsi invalidateWealthQueries yang dipanggil di callback onSuccess setiap mutation hook. '
    'Sebagai contoh, ketika pengguna menambahkan transaksi baru, cache untuk transactions, snapshot, '
    'dan budgets akan di-invalidate sekaligus, menyebabkan widget Keuangan di halaman Command Center '
    'otomatis merefresh data dari Supabase tanpa perlu reload halaman. Mekanisme ini memastikan '
    'konsistensi data di seluruh aplikasi secara real-time.',
    style_body_justify,
))

# === Section 3: Arsitektur Teknis ===
story.append(Spacer(1, 4))
story.append(Paragraph('<b>3. Arsitektur Teknis</b>', style_h1))
story.append(hr())

story.append(Paragraph(
    'Seluruh modul Wealth mengikuti pola arsitektur berlapis (layered architecture) yang memisahkan '
    'tanggung jawab secara jelas antara komponen UI, hooks pengambilan data, layanan bisnis, '
    'dan akses data. Pola ini memastikan bahwa tidak ada komponen yang memanggil Supabase secara '
    'langsung, sehingga memudahkan testing, penggantian backend, dan pemeliharaan kode.',
    style_body_justify,
))

story.append(Spacer(1, 6))

# Architecture table
arch_header = [
    Paragraph('<b>Layer</b>', style_table_header),
    Paragraph('<b>Komponen</b>', style_table_header),
    Paragraph('<b>Tanggung Jawab</b>', style_table_header),
]
arch_rows = [
    ['UI Components', 'account-card.tsx, transaction-form-dialog.tsx, budget-card.tsx, dll.', 'Render tampilan, tangkap input pengguna, tampilkan loading/error state'],
    ['Query Hooks', 'useAccounts, useCreateTransaction, useBudgetUtilization, dll.', 'TanStack Query wrapper, cache management, invalidation otomatis'],
    ['Service', 'wealth.service.ts (getWealthSnapshot, getBudgetUtilization)', 'Agregasi data, transformasi format (formatRupiah), logika bisnis'],
    ['Repository', 'wealth.repository.ts (accountRepo, transactionRepo, budgetRepo)', 'Abstraksi akses data Supabase, query builder, error handling'],
    ['Database', 'Supabase PostgreSQL (accounts, categories, transactions, budgets)', 'Penyimpanan data persisten, Row Level Security, trigger updated_at'],
]

arch_data = [arch_header]
for row in arch_rows:
    arch_data.append([Paragraph(cell, style_table_cell) for cell in row])

arch_table = Table(arch_data, colWidths=[W*0.18, W*0.38, W*0.44])
arch_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_STRIPE),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_STRIPE),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BOX', (0, 0), (-1, -1), 0.5, BORDER),
    ('LINEBELOW', (0, 0), (-1, -2), 0.5, BORDER),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
]))
story.append(arch_table)
story.append(Spacer(1, 10))

# New hooks table
story.append(Paragraph('<b>3.1 Query Hooks Baru di Sprint 4</b>', style_h2))
story.append(Paragraph(
    'Sprint 4 menambahkan enam mutation hooks dan satu query hook baru untuk mendukung operasi '
    'CRUD penuh. Setiap mutation hook secara otomatis menginvalidasi cache query terkait melalui '
    'fungsi invalidateWealthQueries, memastikan konsistensi data di seluruh halaman setelah setiap operasi.',
    style_body_justify,
))
story.append(Spacer(1, 4))

hooks_header = [
    Paragraph('<b>Hook Name</b>', style_table_header),
    Paragraph('<b>Tipe</b>', style_table_header),
    Paragraph('<b>Cache yang Di-invalidate</b>', style_table_header),
]
hooks_rows = [
    ['useUpdateAccount', 'Mutation', 'accounts, snapshot'],
    ['useDeleteAccount', 'Mutation', 'accounts, transactions, snapshot'],
    ['useUpdateTransaction', 'Mutation', 'transactions, snapshot, budgets'],
    ['useDeleteTransaction', 'Mutation', 'transactions, snapshot, budgets'],
    ['useUpdateBudget', 'Mutation', 'budgets, snapshot'],
    ['useDeleteBudget', 'Mutation', 'budgets, snapshot'],
    ['useBudgetUtilization', 'Query', '- (read-only, 2 menit stale time)'],
]
hooks_data = [hooks_header]
for row in hooks_rows:
    hooks_data.append([Paragraph(cell, style_table_cell) for cell in row])

hooks_table = Table(hooks_data, colWidths=[W*0.35, W*0.18, W*0.47])
hooks_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    *[('BACKGROUND', (0, i), (-1, i), colors.white if i % 2 == 1 else TABLE_STRIPE) for i in range(1, 8)],
    ('BOX', (0, 0), (-1, -1), 0.5, BORDER),
    ('LINEBELOW', (0, 0), (-1, -2), 0.5, BORDER),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(hooks_table)
story.append(Spacer(1, 10))

# File structure
story.append(Paragraph('<b>3.2 Struktur File Baru</b>', style_h2))
story.append(Paragraph(
    'Berikut adalah daftar seluruh file yang dibuat atau dimodifikasi dalam Sprint 4, terorganisir '
    'berdasarkan direktori proyek. Komponen UI ditempatkan di src/components/wealth/, halaman '
    'route di src/app/(dashboard)/wealth/, dan query hooks yang diperbarui di src/lib/queries/.',
    style_body_justify,
))
story.append(Spacer(1, 4))

file_header = [
    Paragraph('<b>File Path</b>', style_table_header),
    Paragraph('<b>Keterangan</b>', style_table_header),
]
file_rows = [
    ['src/components/wealth/account-card.tsx', 'Card tampilan akun dengan ikon tipe dan badge warna'],
    ['src/components/wealth/account-form-dialog.tsx', 'Dialog form tambah/edit akun (react-hook-form + zod)'],
    ['src/components/wealth/transaction-form-dialog.tsx', 'Dialog form transaksi dengan toggle tipe dan quick-add kategori'],
    ['src/components/wealth/transaction-item.tsx', 'Item baris transaksi untuk list view'],
    ['src/components/wealth/budget-card.tsx', 'Card budget dengan progress bar adaptif'],
    ['src/components/wealth/budget-form-dialog.tsx', 'Dialog form tambah/edit budget'],
    ['src/components/wealth/empty-state.tsx', 'Komponen state kosong reusable'],
    ['src/components/wealth/confirm-delete-dialog.tsx', 'Dialog konfirmasi hapus'],
    ['src/components/wealth/index.ts', 'Barrel export untuk komponen wealth'],
    ['src/app/(dashboard)/wealth/page.tsx', 'Halaman overview Wealth (diubah dari placeholder)'],
    ['src/app/(dashboard)/wealth/accounts/page.tsx', 'Halaman daftar akun dengan CRUD'],
    ['src/app/(dashboard)/wealth/transactions/page.tsx', 'Halaman daftar transaksi dengan filter'],
    ['src/app/(dashboard)/wealth/budgets/page.tsx', 'Halaman budget tracking dengan navigator bulan'],
    ['src/lib/queries/wealth-queries.ts', 'Ditambah: 6 mutation hooks + 1 query hook baru'],
]
file_data = [file_header]
for i, row in enumerate(file_rows):
    file_data.append([Paragraph(row[0], ParagraphStyle('fc', fontName='NotoSansSC', fontSize=8, leading=12, textColor=TEXT_PRIMARY)),
                     Paragraph(row[1], style_table_cell)])

file_table = Table(file_data, colWidths=[W*0.48, W*0.52])
file_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    *[('BACKGROUND', (0, i), (-1, i), colors.white if i % 2 == 1 else TABLE_STRIPE) for i in range(1, len(file_rows)+1)],
    ('BOX', (0, 0), (-1, -1), 0.5, BORDER),
    ('LINEBELOW', (0, 0), (-1, -2), 0.5, BORDER),
    ('TOPPADDING', (0, 0), (-1, -1), 4),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
]))
story.append(file_table)

# ━━ Build Body PDF ━━
doc = SimpleDocTemplate(
    BODY_PDF, pagesize=A4,
    leftMargin=20*mm, rightMargin=20*mm,
    topMargin=20*mm, bottomMargin=20*mm,
    title='Life OS Sprint 4: Wealth CRUD',
    author='Z.ai',
    subject='Ringkasan Sprint 4 - Modul Wealth CRUD',
)
doc.build(story)
print(f'Body PDF: {BODY_PDF}')

# ━━ Build Cover HTML ━━
W_PX = 794
H_PX = 1123  # A4 aspect ratio
U = W_PX * 0.05

cover_html = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
@page {{ size: 210mm 297mm; margin: 0; }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{ width: 210mm; height: 297mm; background: #f5f5f5; }}
.cover {{ width: {W_PX}px; height: {H_PX}px; position: relative; overflow: hidden; background: #f5f5f5; }}

/* Decorative block */
.block {{ position: absolute; top: 0; left: 0; width: 100%; height: 55%; background: #675d3e; }}
.block-accent {{ position: absolute; top: 55%; left: 0; width: 100%; height: 4px; background: #96771c; }}

/* Content zones */
.kicker {{ position: absolute; top: {H_PX * 0.18}px; left: {U * 4}px; font-family: 'Noto Sans SC', sans-serif; font-size: 13px; font-weight: 400; color: rgba(255,255,255,0.6); letter-spacing: 3px; text-transform: uppercase; }}
.title {{ position: absolute; top: {H_PX * 0.26}px; left: {U * 4}px; right: {U * 4}px; font-family: 'Noto Sans SC', sans-serif; font-size: 42px; font-weight: 700; color: #ffffff; line-height: 1.15; }}
.summary {{ position: absolute; top: {H_PX * 0.48}px; left: {U * 4}px; right: {U * 4}px; font-family: 'Noto Sans SC', sans-serif; font-size: 16px; font-weight: 400; color: rgba(255,255,255,0.85); line-height: 1.6; max-width: 70%; }}
.meta {{ position: absolute; top: {H_PX * 0.68}px; left: {U * 4}px; font-family: 'Noto Sans SC', sans-serif; font-size: 14px; color: #84817a; line-height: 1.6; }}
.meta span {{ color: #272623; font-weight: 600; }}
.footer {{ position: absolute; bottom: {U * 4}px; left: {U * 4}px; right: {U * 4}px; font-family: 'Noto Sans SC', sans-serif; font-size: 11px; color: #84817a; letter-spacing: 1px; text-transform: uppercase; }}
</style>
</head>
<body>
<div class="cover">
  <div class="block"></div>
  <div class="block-accent"></div>
  <div class="kicker">Ringkasan Sprint</div>
  <div class="title">Life OS<br/>Sprint 4: Wealth CRUD</div>
  <div class="summary">Implementasi penuh modul keuangan dengan CRUD akun, transaksi, dan budget. Form tervalidasi, dashboard auto-update, dan arsitektur berlapis yang terhubung langsung ke Supabase.</div>
  <div class="meta">
    <span>Proyek:</span> Life OS - Personal Operating System<br/>
    <span>Tanggal:</span> 26 Juli 2026<br/>
    <span>Teknologi:</span> Next.js 16, Supabase, TanStack Query, react-hook-form, Zod
  </div>
  <div class="footer">Life OS by Z.ai</div>
</div>
</body>
</html>"""

with open(COVER_HTML, 'w', encoding='utf-8') as f:
    f.write(cover_html)
print(f'Cover HTML: {COVER_HTML}')

# ━━ Render Cover PDF ━━
os.system(f'node "{PDF_SKILL_DIR}/scripts/html2poster.js" "{COVER_HTML}" --output "{COVER_PDF}" --width 794px 2>&1')
print(f'Cover PDF: {COVER_PDF}')

# ━━ Merge Cover + Body ━━
reader = pypdf.PdfReader(BODY_PDF)
writer = pypdf.PdfWriter()

# Insert cover
cover_reader = pypdf.PdfReader(COVER_PDF)
writer.add_page(cover_reader.pages[0])

# Insert body pages
for page in reader.pages:
    writer.add_page(page)

writer.add_metadata({
    '/Title': 'Life OS Sprint 4: Wealth CRUD',
    '/Author': 'Z.ai',
    '/Subject': 'Ringkasan Sprint 4 - Modul Wealth CRUD',
    '/Creator': 'Life OS PDF Generator',
})

with open(FINAL_PDF, 'wb') as f:
    writer.write(f)
print(f'Final PDF: {FINAL_PDF}')

# Cleanup temp files
os.remove(BODY_PDF)
os.remove(COVER_HTML)
os.remove(COVER_PDF)
print('Done!')
