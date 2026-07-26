const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Header, Footer, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, PageNumber, PageBreak, BorderStyle, SectionType, ShadingType, TableOfContents, VerticalAlign } = require('docx');

// ── Palette: DM-1 Deep Cyan (Tech report) ──
const bodyColor = "000000";
const primaryColor = "0A1628";
const secondaryColor = "6878A0";
const accentColor = "1B6B7A";
const surfaceColor = "EDF3F5";
const headerBgColor = "1B6B7A";
const headerTextColor = "FFFFFF";
const innerLineColor = "C8DDE2";

const c = (hex) => hex;

// ── Borders ──
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };
const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: innerLineColor },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: innerLineColor },
  left: { style: BorderStyle.SINGLE, size: 1, color: innerLineColor },
  right: { style: BorderStyle.SINGLE, size: 1, color: innerLineColor },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: innerLineColor },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: innerLineColor },
};

// ── Helpers ──
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, color: c(primaryColor), font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}
function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, color: c(primaryColor), font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}
function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: c(primaryColor), font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}
function body(text) {
  return new Paragraph({
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 22, color: c(bodyColor), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  });
}
function bodyBold(text) {
  return new Paragraph({
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 22, color: c(bodyColor), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, bold: true })],
  });
}
function bullet(text) {
  return new Paragraph({
    spacing: { line: 312, after: 60 },
    indent: { left: 480, hanging: 240 },
    children: [
      new TextRun({ text: "\u2022  ", size: 22, color: c(accentColor), font: { ascii: "Calibri" } }),
      new TextRun({ text, size: 22, color: c(bodyColor), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } }),
    ],
  });
}
function statusItem(status, text) {
  const color = status === "PASS" ? "16A34A" : status === "WARN" ? "D97706" : "DC2626";
  return new Paragraph({
    spacing: { line: 312, after: 60 },
    indent: { left: 480, hanging: 360 },
    children: [
      new TextRun({ text: `[${status}]`, size: 22, bold: true, color: c(color), font: { ascii: "Calibri" } }),
      new TextRun({ text: `  ${text}`, size: 22, color: c(bodyColor), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } }),
    ],
  });
}

function makeHeaderRow(cells) {
  return new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: cells.map((text) =>
      new TableCell({
        shading: { fill: headerBgColor, type: ShadingType.CLEAR, color: "auto" },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, size: 20, color: c(headerTextColor), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })] })],
      })
    ),
  });
}
function makeRow(cells, idx) {
  const bgColor = idx % 2 === 0 ? "FFFFFF" : surfaceColor;
  return new TableRow({
    cantSplit: true,
    children: cells.map((text) =>
      new TableCell({
        shading: { fill: bgColor, type: ShadingType.CLEAR, color: "auto" },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ spacing: { line: 280 }, children: [new TextRun({ text, size: 20, color: c(bodyColor), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })] })],
      })
    ),
  });
}
function makeTable(headers, rows, colWidths) {
  return new Table({
    width: { size: 8788, type: WidthType.DXA },
    borders: tableBorders,
    rows: [
      makeHeaderRow(headers),
      ...rows.map((r, i) => makeRow(r, i)),
    ],
  });
}

// ── Cover Recipe R1: Pure Paragraph Left ──
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 20;
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = title.length <= cpl ? [title] : [title.substring(0, Math.floor(title.length / 2)), title.substring(Math.floor(title.length / 2))];
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) {
    lines = [title];
    titlePt = minPt;
  }
  return { titlePt, titleLines: lines };
}
function calcCoverSpacing(params) {
  const { titleLineCount = 1, titlePt = 36, hasSubtitle = false, hasEnglishLabel = false, metaLineCount = 0, fixedHeight = 800, pageHeight = 16838, marginTop = 0, marginBottom = 0 } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const englishLabelHeight = hasEnglishLabel ? (9 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);
  const implicitParaHeight = 3 * 300;
  const contentHeight = titleHeight + subtitleHeight + englishLabelHeight + metaHeight + fixedHeight + implicitParaHeight;
  const remainingSpace = usableHeight - contentHeight;
  const safeRemaining = Math.max(remainingSpace, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  return { topSpacing, bottomSpacing, midSpacing: Math.max(safeRemaining - topSpacing - bottomSpacing, 0) };
}

const coverPalette = { bg: "162235", titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078", accent: "37DCF2" };
const P = coverPalette;

function buildCoverR1() {
  const config = {
    title: "Sprint 3 Review: Wealth Foundation",
    subtitle: "Life OS - Personal Operating System",
    englishLabel: "ENGINEERING REVIEW DOCUMENT",
    metaLines: ["Project: Life OS", "Sprint: 3 of N", "Date: 26 July 2026", "Status: Complete"],
    footerLeft: "Life OS Engineering Team",
    footerRight: "Confidential",
  };
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 38, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt, hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: config.metaLines.length, fixedHeight: 400,
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 };
  const children = [];
  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));
  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
      children: [new TextRun({ text: config.englishLabel.split("").join("  "), size: 18, color: P.accent, font: { ascii: "Calibri" }, characterSpacing: 40 })],
    }));
  }
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true, color: P.titleColor, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
    }));
  }
  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 400 },
      children: [new TextRun({ text: config.subtitle, size: 22, color: P.subtitleColor, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
    }));
  }
  for (const line of config.metaLines) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 18, color: P.metaColor, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
    }));
  }
  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 12 } },
    spacing: { after: 100 },
    children: [
      new TextRun({ text: config.footerLeft, size: 16, color: P.footerColor, font: { ascii: "Calibri" } }),
      new TextRun({ text: "", size: 16 }),
      new TextRun({ text: config.footerRight, size: 16, color: P.footerColor, font: { ascii: "Calibri" } }),
    ],
  }));
  return children;
}

// ── Document ──
const doc = new Document({
  styles: {
    default: { document: { run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 22, color: bodyColor }, paragraph: { spacing: { line: 312 } } } },
    heading1: { run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: primaryColor } },
    heading2: { run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: primaryColor } },
    heading3: { run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, bold: true, color: primaryColor } },
  },
  sections: [
    // ── Cover Section ──
    {
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: buildCoverR1(),
    },
    // ── TOC Section ──
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 } },
      },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Life OS \u2014 Sprint 3 Review", size: 16, color: c(secondaryColor), font: { ascii: "Calibri" } })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ["PAGE \\* ROMAN \\* MERGEFORMAT"], size: 16, color: c(secondaryColor), font: { ascii: "Calibri" } })] })] }) },
      children: [
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "Daftar Isi", size: 36, bold: true, color: c(primaryColor), font: { ascii: "Calibri", eastAsia: "SimHei" } })] }),
        new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "Catatan: Klik kanan pada Daftar Isi lalu pilih \"Update Field\" untuk memperbarui nomor halaman.", size: 18, italics: true, color: c(secondaryColor), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })] }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ── Body Section ──
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 }, pageNumbers: { start: 1 } },
      },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Life OS \u2014 Sprint 3 Review", size: 16, color: c(secondaryColor), font: { ascii: "Calibri" } })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 16, color: c(secondaryColor), font: { ascii: "Calibri" } }), new TextRun({ text: " / Life OS", size: 16, color: c(secondaryColor), font: { ascii: "Calibri" } })] })] }) },
      children: [
        // ─── 1. Sprint Overview ───
        heading1("1. Sprint Overview"),
        heading2("1.1 Sprint Goal"),
        body("Sprint 3 bertujuan membangun Wealth Foundation untuk Life OS dengan mengganti mock data pada widget Keuangan di Dashboard menggunakan data real dari Supabase. Sprint ini memperkenalkan arsitektur data layer yang akan menjadi pattern standar untuk semua module selanjutnya (Mission, Schedule, Kesehatan, Disiplin, Refleksi, Belajar). Pencapaian utama adalah menghubungkan hanya satu widget (Wealth Snapshot) ke Supabase, sementara semua widget lain tetap menggunakan mock data sesuai scope yang ditetapkan."),
        heading2("1.2 Scope Boundary"),
        body("Sprint 3 memiliki scope yang sangat terdefinisi dengan jelas. Hanya Wealth Snapshot widget di Dashboard yang terhubung ke data real. Ini adalah strategi controlled rollout yang sengaja dipilih untuk memvalidasi arsitektur data layer sebelum diterapkan ke module lain. Seluruh widget lain (Life Score, Today Focus, Quick Actions, Recent Activity, AI Coach) tetap sepenuhnya pada mock data tanpa perubahan apapun."),
        body("Sprint 3 juga tidak mencakup pembangunan halaman detail Wealth module. Halaman /wealth tetap menjadi placeholder. Fokusnya murni pada infrastruktur data layer dan koneksi widget Dashboard."),
        heading2("1.3 Key Constraints"),
        bullet("Tidak ada direct Supabase call di dalam React components"),
        bullet("Repository Pattern mengabstraksi semua akses data Supabase"),
        bullet("Service Layer menangani business logic antara Repository dan UI"),
        bullet("TanStack Query mengelola caching, refetching, dan mutations"),
        bullet("Typed interfaces untuk semua data flow (Row, Insert, Update, Aggregate)"),
        bullet("Production build harus pass tanpa error"),
        bullet("Zero ESLint errors dan zero TypeScript errors"),
        bullet("Graceful degradation saat Supabase tidak tersedia"),

        // ─── 2. Architecture ───
        heading1("2. Arsitektur Data Layer"),
        heading2("2.1 Layer Architecture"),
        body("Arsitektur Sprint 3 mengikuti pattern 4-layer yang clean dan testable. Setiap layer memiliki tanggung jawab yang jelas dan tidak saling tumpang tindih. Data flow mengikuti arah satu arah: Component memanggil Hook, Hook memanggil Service, Service memanggil Repository, Repository memanggil Supabase Client. Tidak ada shortcut atau bypass yang diperbolehkan."),
        makeTable(
          ["Layer", "File", "Tanggung Jawab"],
          [
            ["Component", "wealth-snapshot-connected.tsx", "Render UI, memanggil TanStack Query hook"],
            ["Query Hook", "wealth-queries.ts", "Wrap service call dengan useQuery/useMutation"],
            ["Service", "wealth.service.ts", "Business logic, agregasi, formatting"],
            ["Repository", "wealth.repository.ts", "CRUD operations ke Supabase"],
            ["Supabase Client", "client.ts", "Browser-side Supabase connection"],
          ],
        ),
        heading2("2.2 Graceful Degradation"),
        body("Seluruh data layer dirancang untuk degrade secara graceful. Ketika Supabase client tidak tersedia (env vars tidak diset), semua repository methods mengembalikan empty arrays atau null. Service layer mengembalikan safe defaults (0 untuk angka, null untuk perubahan). Widget menampilkan skeleton loading state, lalu fallback ke mock data jika error atau tidak ada data. Ini memastikan aplikasi tetap berfungsi penuh dalam development mode tanpa Supabase connection."),
        heading2("2.3 Dev Sandbox Mode"),
        body("Saat ini .env tidak memiliki NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY, yang berarti seluruh aplikasi berjalan dalam dev sandbox mode. Dalam mode ini: auth checks dilewati (middleware pass-through), semua wealth queries mengembalikan empty data, dan widgets otomatis fallback ke mock data. Ini adalah by-design behavior yang memungkinkan development berlanjut tanpa koneksi Supabase. Untuk mengaktifkan real data, cukup tambahkan env vars dan jalankan SQL migration di Supabase dashboard."),

        // ─── 3. Database Schema ───
        heading1("3. Database Schema"),
        heading2("3.1 Entity Relationship"),
        body("Schema terdiri dari 4 tabel utama: accounts, categories, transactions, dan budgets. Semua tabel memiliki user_id sebagai foreign key ke auth.users(id) dengan ON DELETE CASCADE, memastikan data user terhapus bersih saat akun dihapus. Transactions memiliki foreign key ke accounts (ON DELETE CASCADE) dan categories (ON DELETE SET NULL), sedangkan budgets memiliki foreign key ke categories (ON DELETE CASCADE)."),
        heading2("3.2 Tables"),
        heading3("accounts"),
        body("Menyimpan informasi akun keuangan user: bank, cash, e-wallet, dan investment. Setiap account memiliki type (bank/cash/ewallet/investment), balance (NUMERIC 15,2), currency (default IDR), dan is_active flag. Trigger updated_at otomatis memperbarui timestamp saat row di-update. Index komposit pada (user_id, is_active) dan (user_id, type) untuk query performa."),
        heading3("categories"),
        body("Menyimpan kategori transaksi: income dan expense. Setiap user memiliki kategori sendiri (user-scoped). Field is_default menandai kategori bawaan sistem. Index komposit pada (user_id, type) memungkinkan filter cepat per tipe kategori."),
        heading3("transactions"),
        body("Tabel utama mencatat semua transaksi keuangan. Mendukung 3 tipe: income, expense, dan transfer. Amount disimpan sebagai NUMERIC(15,2) dengan CHECK constraint amount > 0. Date menggunakan DATE type dengan default timezone Asia/Makassar. Index komposit pada (user_id, date DESC) untuk sorting cepat, dan (user_id, date_trunc('month', date)) untuk agregasi bulanan yang efisien."),
        heading3("budgets"),
        body("Menyimpan budget per kategori per period (monthly/weekly). Unique partial index pada (user_id, category_id, period) WHERE is_active = true mencegah duplikasi budget aktif untuk kategori dan period yang sama. Trigger updated_at sama seperti accounts."),
        heading2("3.3 Row Level Security"),
        body("Semua 4 tabel memiliki RLS diaktifkan dengan 4 policy per tabel: SELECT, INSERT, UPDATE, DELETE. Setiap policy menggunakan auth.uid() = user_id sebagai kondisi, memastikan user hanya bisa mengakses data mereka sendiri. Ini adalah security measure kritis yang harus selalu aktif di production."),

        // ─── 4. TypeScript Types ───
        heading1("4. TypeScript Type System"),
        heading2("4.1 Type Categories"),
        body("Type system Wealth domain dirancang dengan 4 kategori tipe yang mencerminkan alur data dari database hingga UI. Enum types mendefinisikan nilai yang diizinkan untuk setiap field. Row types merepresentasikan baris database lengkap. Insert types mendefinisikan payload untuk operasi create (id dan timestamps auto-generated). Update types mendefinisikan payload untuk operasi patch (semua field optional). Aggregate types mendefinisikan data yang sudah diolah untuk konsumsi UI."),
        makeTable(
          ["Kategori", "Tipe", "Jumlah"],
          [
            ["Enums", "AccountType, TransactionType, CategoryType, BudgetPeriod", "4"],
            ["DB Rows", "AccountRow, CategoryRow, TransactionRow, BudgetRow", "4"],
            ["Insert Payloads", "AccountInsert, CategoryInsert, TransactionInsert, BudgetInsert", "4"],
            ["Update Payloads", "AccountUpdate, CategoryUpdate, TransactionUpdate, BudgetUpdate", "4"],
            ["Aggregation", "WealthSnapshotData, BudgetUtilizationItem", "2"],
          ],
        ),

        // ─── 5. Implementation ───
        heading1("5. Implementation Details"),
        heading2("5.1 Repository Pattern"),
        body("Repository layer mengimplementasikan 4 repository objects: accountRepo, categoryRepo, transactionRepo, dan budgetRepo. Setiap repo menyediakan methods CRUD lengkap (findAll, findById, create, update, delete) plus domain-specific queries. accountRepo memiliki getTotalBalance() yang menjumlahkan balance akun aktif. transactionRepo memiliki getTodayExpense() untuk agregasi pengeluaran harian dan getMonthExpenseByCategory() untuk agregasi bulanan per kategori. Semua methods mengembalikan typed arrays atau objects, bukan Supabase response mentah."),
        heading2("5.2 Service Layer"),
        body("Service layer mengimplementasikan 2 primary functions. getWealthSnapshot() adalah fungsi utama yang dipakai Dashboard widget, mengagregasi data dari 4 repository secara paralel menggunakan Promise.all(). Fungsi ini menghitung: totalBalance (jumlah saldo akun aktif), todayExpense (total pengeluaran hari ini), budgetUtilization (rata-rata persentase budget terpakai), totalBalanceChange (perubahan net flow bulan ini vs bulan lalu), dan todayExpenseChange (perubahan pengeluaran vs minggu lalu). getBudgetUtilization() untuk detail budget per kategori akan digunakan di halaman Wealth module (Sprint mendatang)."),
        body("Formatting helpers: formatRupiah() mengkonversi angka ke format Rupiah Indonesia (Rp 12.4 Jt, Rp 850.000). formatPercent() membulatkan persentase ke integer terdekat."),
        heading2("5.3 TanStack Query Setup"),
        heading3("Query Client Configuration"),
        body("QueryClient dikonfigurasi dengan: staleTime 2 menit (data dianggap fresh selama 2 menit), gcTime 10 menit (cache entries dihapus setelah 10 menit tidak digunakan), refetchOnWindowFocus false (dashboard personal tidak perlu refetch otomatis), retry 1 kali untuk queries dan 0 kali untuk mutations. Configuration ini mengurangi beban Supabase sambil memastikan data cukup fresh untuk dashboard."),
        heading3("Query Key Factory"),
        body("wealthKeys factory menggunakan pattern [domain, entity, ...identifiers, filters] untuk mencegah key collision dan memungkinkan invalidasi yang granular. Setiap entity (accounts, categories, transactions, budgets, snapshot) memiliki dedicated key builders. invalidateWealthQueries() helper memungkinkan invalidasi multiple scopes sekaligus, dan selalu otomatis men-invalidate snapshot karena snapshot bergantung pada semua data wealth."),
        heading3("Query Hooks"),
        makeTable(
          ["Hook", "Tipe", "Stale Time", "Invalidate On"],
          [
            ["useWealthSnapshot", "Query", "2 min", "accounts, transactions, budgets"],
            ["useAccounts", "Query", "5 min", "accounts"],
            ["useCategories", "Query", "10 min", "categories"],
            ["useTransactions", "Query", "2 min", "transactions"],
            ["useBudgets", "Query", "5 min", "budgets"],
            ["useCreateAccount", "Mutation", "-", "accounts, snapshot"],
            ["useCreateTransaction", "Mutation", "-", "transactions, snapshot, budgets"],
            ["useCreateBudget", "Mutation", "-", "budgets, snapshot"],
          ],
        ),

        // ─── 6. Widget Connection ───
        heading1("6. Wealth Snapshot Widget Connection"),
        heading2("6.1 Widget Architecture"),
        body("WealthSnapshotConnected component adalah bridge antara data real Supabase dan UI widget. Component ini menggunakan useWealthSnapshot() hook untuk mengambil data, lalu membangun SnapshotCard untuk Keuangan menggunakan data real, sambil mempertahankan 3 card lainnya (Kesehatan, Target, Habit) dari mock data. Hasilnya adalah array 4 SnapshotCard yang diteruskan ke SnapshotCardsWidget yang sudah ada."),
        body("Widget memiliki 4 state: (1) Loading - menampilkan skeleton, (2) Error - fallback ke mock data penuh, (3) No Data - fallback ke mock data, (4) Success - menampilkan real data untuk Keuangan + mock untuk lainnya. Transisi antar state terjadi secara seamless tanpa flash atau layout shift."),
        heading2("6.2 Dashboard Integration"),
        body("Di dashboard page, WealthSnapshotConnected menggantikan SnapshotCardsWidget langsung. Grid layout 4-kolom tidak berubah. Widget Wealth Snapshot menempati colSpan=2, rowSpan=2 di posisi bottom-right grid. Semua widget lain (LifeScoreWidget, TodayFocusWidget, QuickActionsWidget, AICoachWidget, RecentActivityWidget) tetap menggunakan mock data tanpa modifikasi."),

        // ─── 7. Definition of Done ───
        heading1("7. Definition of Done & QA Checklist"),
        heading2("7.1 Sprint 3 DoD"),
        statusItem("PASS", "SQL migration file tersedia di supabase/migrations/20260726_wealth_foundation.sql"),
        statusItem("PASS", "4 tabel (accounts, categories, transactions, budgets) terdefinisi lengkap"),
        statusItem("PASS", "Foreign keys, CHECK constraints, dan indexes terdefinisi"),
        statusItem("PASS", "Row Level Security (RLS) aktif untuk semua tabel"),
        statusItem("PASS", "TypeScript types lengkap (Row, Insert, Update, Aggregate)"),
        statusItem("PASS", "Repository Pattern mengabstraksi semua Supabase calls"),
        statusItem("PASS", "Service Layer menangani business logic"),
        statusItem("PASS", "TanStack Query setup (QueryClient, Keys, Hooks, Mutations)"),
        statusItem("PASS", "Hanya Wealth Snapshot widget terhubung ke real data"),
        statusItem("PASS", "Semua widget lain tetap menggunakan mock data"),
        statusItem("PASS", "Zero direct Supabase calls di React components"),
        statusItem("PASS", "Graceful degradation berfungsi (dev sandbox mode)"),
        statusItem("PASS", "Production build pass (15/15 pages, 0 compile errors)"),
        statusItem("PASS", "Zero TypeScript errors di src/ (skills/ di-exclude)"),
        statusItem("PASS", "Sprint 3 Review document di-generate"),
        heading2("7.2 Build Verification"),
        makeTable(
          ["Check", "Result", "Detail"],
          [
            ["next build", "PASS", "Compiled successfully, 15/15 pages generated"],
            ["tsc --noEmit (src/)", "PASS", "Zero errors"],
            ["Middleware warning", "WARN", "middleware convention deprecated (Next.js 16 proxy migration)"],
          ],
        ),

        // ─── 8. Sprint Metrics ───
        heading1("8. Sprint Metrics"),
        makeTable(
          ["Metric", "Value"],
          [
            ["Files Created", "7 (types, repository, service, queries x3, widget)"],
            ["Files Modified", "6 (dashboard page, button, toast, toaster, use-toast, auth-store)"],
            ["SQL Migration", "1 file, 136 lines, 4 tables, 16 RLS policies"],
            ["TypeScript Types", "18 interfaces/types"],
            ["Repository Methods", "19 methods across 4 repos"],
            ["Service Functions", "4 (snapshot, budget util, formatRupiah, formatPercent)"],
            ["TanStack Query Hooks", "10 (6 queries + 4 mutations)"],
            ["Production Build", "11.0s compile, 280ms page generation"],
            ["TypeScript Errors Fixed", "26 (widget props, shadcn variants, toast stubs, null checks)"],
          ],
        ),

        // ─── 9. Risk Register ───
        heading1("9. Risk Register"),
        makeTable(
          ["Risk", "Severity", "Mitigation", "Status"],
          [
            ["Supabase env vars belum diset", "Medium", "Graceful degradation, dev sandbox mode aktif", "Accepted"],
            ["SQL migration belum di-apply ke Supabase", "High", "File migration siap, perlu manual apply di dashboard", "Pending"],
            ["Next.js 16 middleware deprecation", "Low", "Middleware masih berfungsi, migration ke proxy di Sprint 4+", "Monitored"],
            ["No seed data untuk new users", "Medium", "Perlu trigger/function untuk default categories saat signup", "Deferred"],
            ["Prisma legacy SQLite unused", "Low", "Tidak interferes, bisa dihapus saat cleanup", "Monitored"],
            ["next-auth dependency unused", "Low", "Tidak interferes, bisa dihapus saat cleanup", "Monitored"],
          ],
        ),

        // ─── 10. Retrospective ───
        heading1("10. Sprint Retrospective"),
        heading2("10.1 What Went Well"),
        bullet("Arsitektur 4-layer (Component -> Hook -> Service -> Repository) terbukti clean dan maintainable. Pattern ini siap di-replikasi untuk module Mission, Schedule, dan lainnya tanpa perubahan struktur."),
        bullet("Graceful degradation berfungsi sempurna. Aplikasi tetap fully functional tanpa Supabase connection, memungkinkan parallel development."),
        bullet("Query Key Factory dengan invalidation helper memudahkan cache management. Satu pemanggilan invalidateWealthQueries() cukup untuk refresh semua related queries."),
        bullet("Fix TypeScript errors dari Sprint 1/2 (widget props, shadcn variants, toast stubs, auth-store null checks) meningkatkan codebase quality secara signifikan."),
        heading2("10.2 What Could Be Improved"),
        bullet("SQL migration belum bisa di-apply otomatis. Perlu setup Supabase CLI atau workflow manual yang lebih jelas untuk Sprint 4."),
        bullet("Tidak ada seed data mechanism. User baru akan melihat dashboard kosong. Perlu function/trigger yang membuat default categories dan accounts saat user signup."),
        bullet("Tests belum ditulis. Sprint 3 fokus pada implementation, tetapi unit tests untuk service dan repository seharusnya masuk Sprint 4 sebagai technical debt."),
        bullet("Widget card sizing (colSpan/rowSpan) masih didefinisikan di dalam widget component, bukan di dashboard page. Ini membuat layout grid kurang declarative."),

        // ─── 11. Performance Baseline ───
        heading1("11. Performance Baseline"),
        body("Berikut adalah baseline performance untuk Sprint 3. Semua pengukuran dilakukan dalam dev sandbox mode (tanpa Supabase connection), sehingga hanya mengukur client-side performance tanpa network latency. Network performance akan diukur kembali setelah Supabase connection aktif di Sprint 4 atau Sprint 5."),
        makeTable(
          ["Metric", "Value", "Notes"],
          [
            ["Build Compile Time", "11.0s", "Turbopack, cold build"],
            ["Page Generation", "280-310ms", "15 static pages"],
            ["Bundle Size (est.)", "Moderate", "React 19 + TanStack Query + Supabase SSR + 40+ UI components"],
            ["Query Stale Time", "2 min", "Configured for dashboard use case"],
            ["Cache GC Time", "10 min", "Balanced between memory and freshness"],
            ["Parallel Data Fetch", "5 calls", "getWealthSnapshot uses Promise.all for 5 repo calls"],
          ],
        ),

        // ─── 12. ADR ───
        heading1("12. Architecture Decision Records"),
        heading2("ADR-001: Repository Pattern over Direct Supabase Calls"),
        bodyBold("Context: React components membutuhkan akses data ke Supabase. Pilihan ada antara direct calls di components vs abstraction layer."),
        bodyBold("Decision: Menggunakan Repository Pattern sebagai abstraction layer antara Supabase client dan business logic."),
        bodyBold("Rationale: (1) Testability - repository bisa di-mock tanpa Supabase connection. (2) Consistency - semua data access melalui satu pattern. (3) Migration flexibility - jika Supabase diganti, hanya repository yang perlu diubah. (4) Centralized error handling - semua Supabase errors ditangani di satu tempat."),
        bodyBold("Consequences: Sedikit lebih banyak boilerplate code, tetapi tradeoff ini sepadan dengan maintainability jangka panjang."),
        heading2("ADR-002: TanStack Query over SWR or React Query Legacy"),
        bodyBold("Context: Pilihan library untuk server state management di React. Opsi: TanStack Query v5, SWR, atau manual fetch."),
        bodyBold("Decision: Menggunakan TanStack Query v5 sebagai single source of truth untuk server state."),
        bodyBold("Rationale: (1) Query Key Factory memungkinkan invalidasi granular. (2) Built-in cache management (staleTime, gcTime). (3) Mutation hooks dengan automatic cache invalidation. (4) DevTools untuk debugging. (5) React 19 compatible."),
        heading2("ADR-003: Controlled Rollout (Wealth Only)"),
        bodyBold("Context: Keputusan apakah menghubungkan semua widgets sekaligus atau satu per satu."),
        bodyBold("Decision: Hanya Wealth Snapshot widget yang terhubung ke real data. Semua widget lain tetap mock."),
        bodyBold("Rationale: (1) Validasi arsitektur data layer sebelum scaling. (2) Risk minimization - jika ada bug, terbatas pada satu widget. (3) Clear demo of before/after mock vs real data. (4) Setiap module memiliki kompleksitas data yang berbeda, perlu dipelajari satu per satu."),

        // ─── 13. CTO Review ───
        heading1("13. CTO Review Checklist"),
        body("Berikut adalah checklist untuk CTO review setelah Sprint 3 selesai. Item-item ini memerlukan aksi dari CTO sebelum Sprint 4 dimulai."),
        makeTable(
          ["Item", "Action Required", "Priority"],
          [
            ["Supabase Project Setup", "Buat project Supabase, dapatkan URL dan anon key, set di .env", "High"],
            ["Apply SQL Migration", "Jalankan 20260726_wealth_foundation.sql di Supabase dashboard", "High"],
            ["RLS Verification", "Pastikan RLS policies aktif dan berfungsi (test dengan 2 user berbeda)", "High"],
            ["GitHub Repository", "Setup remote repository dan push codebase", "Medium"],
            ["Seed Data Strategy", "Setuju atau revisi rencana seed data untuk new users", "Medium"],
            ["Sprint 4 Scope Approval", "Review dan approve Sprint 4 plan (full Wealth module page)", "Medium"],
            ["Environment Variables", "Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY ke .env", "High"],
            ["Middleware Migration", "Decide apakah migrasi middleware ke proxy di Sprint 4 atau defer", "Low"],
          ],
        ),

        // ─── 14. Sprint 4 Recommendations ───
        heading1("14. Sprint 4 Recommendations"),
        heading2("14.1 Suggested Scope"),
        bullet("Full Wealth module page (/wealth) dengan tabs: Akun, Transaksi, Budget, Laporan"),
        bullet("CRUD UI untuk accounts (tambah, edit, hapus akun keuangan)"),
        bullet("Transaction form dengan category picker, account picker, dan date selector"),
        bullet("Budget management UI dengan progress bar per kategori"),
        bullet("Basic spending report chart (pie chart per kategori, bar chart harian/bulanan)"),
        bullet("Seed data mechanism (default categories saat user signup)"),
        heading2("14.2 Technical Debt to Address"),
        bullet("Unit tests untuk service layer dan repository"),
        bullet("Integration test dengan Supabase real connection"),
        bullet("Error boundary untuk wealth widgets"),
        bullet("Optimistic updates pada mutations"),
        bullet("Cleanup Prisma legacy dan next-auth unused dependency"),
        heading2("14.3 Architecture Evolution"),
        body("Sprint 4 harus memvalidasi bahwa pattern yang dibangun di Sprint 3 cukup robust untuk module page yang lebih kompleks. Jika pattern perlu adjust, lakukan di awal Sprint 4 sebelum membangun fitur baru. Target akhir adalah pattern yang bisa di-copy-paste dengan minimal modification untuk module Mission, Schedule, dan module lainnya di Sprint 5+."),
      ],
    },
  ],
});

const outputPath = "/home/z/my-project/download/Sprint_3_Review_Wealth_Foundation.docx";
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outputPath, buf);
  console.log(`Document saved to: ${outputPath}`);
});
