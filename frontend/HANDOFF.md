# Money Tracking App — UI/UX Handoff Documentation
### Design Reference: Mobile App + Web Dashboard
**الحالة:** هذا المستند تحليل تقني للتصميم المرفق (Visual Reference)، مُعد ليكون مرجعًا مباشرًا لـ Claude Code أو أي مطور عند البدء في التنفيذ.

---

## 1. Product Overview

تطبيق **Money Tracking** — تطبيق لإدارة الأموال الشخصية (Personal Finance) يشمل: تتبع الرصيد، الحسابات البنكية والمحافظ الإلكترونية، المعاملات (دخل/مصروفات)، التحويلات، أهداف الادخار، التقارير المالية، والاشتراكات (نموذج Premium/Subscription).

المشروع له **واجهتان متكاملتان**:
- **Mobile App** (تصميم Native/App-like، Bottom Navigation)
- **Web Dashboard** (تصميم SaaS، Sidebar Navigation)

كلاهما بنفس الهوية البصرية، لكن بتخطيط مختلف يناسب كل منصة.

---

## 2. Design System

### 2.1 Color Tokens

| Token Name | Usage | Value (Reference) |
|---|---|---|
| `color-primary` | Primary brand color، الأزرار الأساسية، Active states، الشريط العلوي لبطاقة الرصيد | Emerald/Teal Green |
| `color-income` | كل ما يخص الدخل (Income) — نص، أيقونات، أعمدة الرسم البياني | Green |
| `color-expense` | كل ما يخص المصروفات (Expenses) — نص، أيقونات، أعمدة الرسم البياني | Red |
| `color-background` | خلفية الصفحة الأساسية | White / Off-White |
| `color-surface` | خلفية الكروت | White |
| `color-text-primary` | العناوين والنصوص الأساسية | Dark Gray / Near-Black |
| `color-text-secondary` | النصوص الفرعية، التواريخ، الأوصاف | Medium Gray |
| `color-border` | حدود الـ Inputs والفواصل | Light Gray |
| **ألوان التصنيفات (Category Colors)** | تُستخدم في الـ Donut Chart لتصنيفات المصروفات فقط | أخضر (Food & Drinks)، أصفر/برتقالي (Shopping)، أزرق (Bills)، بنفسجي (Transport)، رمادي (Others) |
| `color-dark-mode-bg` | خلفية وضع Dark Mode | أخضر غامق/أسود مائل للأخضر |

**ملاحظة مهمة:** ألوان التصنيفات (Category Colors) في الـ Donut Chart هي ألوان **Semantic خاصة بتمثيل البيانات فقط** — لا تُستخدم كألوان Brand أو في أي مكان آخر بالواجهة (الأزرار، الروابط، الـ Navigation).

### 2.2 Typography

- **Font Family:** Sans-serif نظيف وواضح، مناسب لعرض أرقام مالية بدقة (خط واحد فقط للتطبيق كله).
- **الأرقام المالية (المبالغ):** دائمًا Bold وبحجم أكبر نسبيًا من باقي النص المحيط بها — أهم عنصر بصري في كل كارد.
- **Headings:** Bold
- **Body / Labels:** Regular / Medium
- **Subtext (تواريخ، ملاحظات):** Regular، لون `color-text-secondary`

### 2.3 Spacing & Layout Grid

- **Mobile:** تخطيط عمودي واحد (Single column)، Padding ثابت حول المحتوى، Bottom Navigation ثابت أسفل الشاشة دائمًا.
- **Desktop:** Sidebar ثابت على اليسار + منطقة محتوى رئيسية مقسمة لـ Grid (عادة 3-4 أعمدة للـ Stat Cards، وGrid مرن للكروت والجداول الأكبر).
- مسافات متسقة بين الكروت (Gap ثابت) في كل الصفحات، Desktop وMobile.

### 2.4 Border Radius
- **Radius كبير نسبيًا** (أكبر من متوسط) على: الكروت الرئيسية، بطاقة الرصيد (Total Balance)، الأزرار، الـ Bottom Sheet/Modals.
- Radius متوسط على العناصر الأصغر (أزرار صغيرة، Badges، صفوف الجدول).

### 2.5 Shadows
- **Soft Shadows خفيفة جدًا** على الكروت — تُستخدم للفصل البصري بين الكروت والخلفية، وليس لإحداث تأثير درامي.

### 2.6 Buttons
| النوع | الاستخدام | الشكل |
|---|---|---|
| **Primary (Solid Green)** | الفعل الأساسي (Add Transaction, Add Account, Continue, Save) | خلفية خضراء صلبة، نص أبيض، Rounded كبير |
| **Secondary/Tab Toggle** | التبديل بين خيارين (Expense/Income Tab في Add Transaction) | Tab بخلفية فاتحة، الاختيار النشط بلون مميز (أحمر للـ Expense، أخضر/محايد للـ Income) |
| **Icon Button** | إجراءات سريعة (See All, Add Account +, Filter, Notification Bell) | أيقونة فقط أو أيقونة + نص صغير |
| **Upgrade CTA** | زر ترويجي مميز (Upgrade to Premium/Upgrade Now) | أخضر صلب، بارز داخل بطاقة ترويجية خاصة |

### 2.7 Inputs
- Label واضح فوق كل Input.
- حقول الإدخال المالي (Amount) بها بادئة عملة واضحة ("EGP") وحجم خط أكبر من باقي الحقول.
- حقول الاختيار (Category, Account) بشكل Dropdown/Select قابل للنقر مع أيقونة أو صورة صغيرة تعبيرية.
- حقل التاريخ (Date) بأيقونة تقويم.

### 2.8 Cards (العنصر الأهم في التصميم كله)

**Total Balance Card (Hero Card):**
- الكارد الأبرز في الصفحة الرئيسية، خلفية خضراء صلبة (لون Primary) وليست بيضاء، تحتوي: التسمية، المبلغ الكبير Bold، نسبة التغيير، وأيقونة إخفاء/إظهار الرصيد (Eye icon).

**Stat Card (Income/Expenses/Savings):**
- خلفية بيضاء، أيقونة صغيرة، تسمية، مبلغ Bold، ونسبة تغيير ملونة (أخضر للزيادة الإيجابية، أحمر للسلبية) مع سهم اتجاه.

**Account Card:**
- تمثل حساب بنكي/محفظة إلكترونية/نقدي — أيقونة ولون خلفية خفيف مميز لكل نوع حساب (أزرق للبنك، أحمر لـ Vodafone Cash، بنفسجي لـ InstaPay، أخضر للـ Cash)، اسم الحساب، آخر أرقام الحساب (Masked)، والرصيد.

**Transaction Row/Card:**
- أيقونة تصنيف صغيرة دائرية، اسم المعاملة، الوقت/التاريخ + طريقة الدفع، والمبلغ (أخضر مع + للدخل، أحمر مع - للمصروف).

**Chart Card (Donut/Bar/Line):**
- خلفية بيضاء، عنوان + فلتر زمني (This Month/dropdown)، الرسم البياني، Legend بجانب أو أسفل الرسم يوضح الألوان والنسب.

**Premium/Upgrade Card:**
- كارد ترويجي مميز داخل الـ Sidebar (Desktop) بخلفية مختلفة قليلًا (تدرج فاتح) مع أيقونة، نص تحفيزي، وزر Upgrade.

### 2.9 Charts (عنصر أساسي متكرر)
- **Donut Chart:** لتوزيع المصروفات حسب التصنيف (Spending Overview) — دائمًا مع Legend يوضح النسبة المئوية لكل تصنيف.
- **Line Chart:** لعرض اتجاه الدخل/المصروفات عبر الوقت (Monthly Trend) — خطين منفصلين بالأخضر (Income) والأحمر (Expenses).
- **Bar Chart:** لمقارنة الدخل مقابل المصروفات (Income vs Expenses) في فترة معينة.

### 2.10 Icons
- Line/Outline icons بسيطة وواضحة، كل تصنيف مصروف له أيقونة مميزة خاصة به (عربة تسوق = Shopping، طبق طعام = Food & Drinks، سيارة = Transport، لمبة = Bills).

### 2.11 Navigation

**Mobile — Bottom Navigation (ثابت):**
Home / Transactions / Accounts / Reports / Profile — 5 عناصر، الأيقونة النشطة بلون Primary مع Label، الباقي رمادي.

**Desktop — Sidebar (ثابت على اليسار):**
Logo + اسم التطبيق أعلى الـ Sidebar، ثم روابط: Dashboard, Accounts, Transactions, Income, Expenses, Transfer, Savings Goals, Budgets, Reports, Subscriptions, Settings — الرابط النشط بخلفية فاتحة ولون نص أخضر. أسفل الـ Sidebar: كارد "Upgrade to Premium" ثم رابط "Log out".

### 2.12 Dark Mode
- يوجد تصميم مخصص لوضع Dark Mode مذكور صراحة في المراجع (خلفية داكنة خضراء/سوداء، نفس بنية بطاقة الرصيد لكن بألوان معكوسة). يجب دعم Theme Toggle (Light/Dark) كخاصية أساسية في التطبيق.

---

## 3. Page Inventory

### Mobile App

| الشاشة | الوظيفة |
|---|---|
| Home | نظرة عامة: بطاقة الرصيد الكلي، الدخل/المصروفات، Spending Overview (Donut)، أحدث المعاملات |
| My Accounts | عرض كل الحسابات (بنكي، محافظ إلكترونية، نقدي) + زر إضافة حساب |
| Transactions | قائمة كل المعاملات مع فلترة (All/Income/Expenses) وبحث، مجمعة حسب التاريخ |
| Add Transaction | فورم إضافة معاملة جديدة (Expense/Income Toggle + تفاصيل) |
| Reports | ملخص مالي (Income/Expenses/Savings) + Donut Chart + Monthly Trend (Line Chart) |
| Profile | بيانات المستخدم + قائمة إعدادات (Personal Info, Linked Accounts, Categories, Notifications, Security, Help, Logout) |
| Transfer Money | تحويل مبلغ بين حسابين (From/To) |
| ATM Withdrawal | سحب من حساب بنكي مع تحديد موقع ATM |
| Add Account | إضافة حساب جديد (اختيار نوع الحساب: بنكي/محفظة/نقدي) |
| Dark Mode (Home) | نفس صفحة Home بنسخة Dark Theme |

### Web Dashboard

| الصفحة | الوظيفة |
|---|---|
| Dashboard | نظرة عامة شاملة (نفس محتوى Home Mobile لكن بتخطيط Grid أوسع) |
| Accounts | إدارة كل الحسابات + جدول Account Summary تفصيلي |
| Transactions | جدول معاملات كامل مع بحث وفلاتر |
| Income | إدارة مصادر الدخل (جدول: Source, Amount, Date, Account, Category) |
| Expenses | إدارة المصروفات (جدول مشابه + إحصائيات Highest Expense, Average) |
| Transfer | تحويل بين الحسابات + سجل التحويلات الأخيرة |
| Savings Goals | أهداف الادخار مع Progress Bars لكل هدف + ملخص عام |
| Reports | تقارير مالية شاملة (Overview, Income vs Expenses, Spending by Category, Custom Report) |
| Subscriptions | إدارة خطة الاشتراك (Free Trial/Premium) + سجل الفواتير |
| Settings | (مذكورة في الـ Sidebar، تفاصيلها غير موضحة بالمرجع الحالي) |

---

## 4. Component Structure (بدون كود)

1. **Sidebar Navigation** (Desktop) — بحالة Active/Inactive لكل رابط
2. **Bottom Navigation** (Mobile) — 5 عناصر بحالة Active/Inactive
3. **Total Balance Card** (Hero Card بخلفية خضراء + Eye toggle لإخفاء الرصيد)
4. **Stat Card** (رقم + تسمية + نسبة تغيير ملونة + سهم اتجاه)
5. **Account Card** (بأنواع مختلفة حسب نوع الحساب ولونه)
6. **Transaction Row** (أيقونة + اسم + تفاصيل + مبلغ ملون)
7. **Donut Chart + Legend** (Component واحد قابل لإعادة الاستخدام بأي بيانات تصنيفية)
8. **Line Chart** (لعرض اتجاهات زمنية)
9. **Bar Chart** (لمقارنة قيمتين)
10. **Add Transaction Form** (مع Expense/Income Toggle)
11. **Add Account Form**
12. **Transfer Form** (From/To Account Selectors)
13. **Savings Goal Card** (مع Progress Bar ونسبة الإنجاز)
14. **Data Table** (Reusable — تُستخدم في Income, Expenses, Transactions, Account Summary)
15. **Category Icon Badge** (أيقونة دائرية ملونة لكل تصنيف مصروف)
16. **Upgrade/Premium Card**
17. **Profile Menu List Item** (أيقونة + نص + سهم Chevron)
18. **Search Input** (مستخدم في أكثر من صفحة)
19. **Filter Tabs** (All/Income/Expenses)
20. **Date Range Selector**
21. **Theme Toggle** (Light/Dark Mode)

---

## 5. Responsive Rules

| العنصر | Desktop | Mobile |
|---|---|---|
| Navigation | Sidebar ثابت يسار | Bottom Navigation ثابت أسفل |
| Stat Cards | صف أفقي من 3-4 كروت متجاورة | كروت مكدسة أو صف من كارتين بجانب بعض |
| Charts | Donut + Line/Bar جنب بعض في نفس الصف | Charts مكدسة عمودي واحد تلو الآخر |
| Tables | جدول كامل بكل الأعمدة | يُحوّل لقائمة كروت مبسطة أو Scroll أفقي |
| Add Transaction/Account | يظهر غالبًا كـ Modal أو صفحة جانبية | يظهر كصفحة كاملة (Full Screen) |
| Sidebar Content (Upgrade Card) | ظاهر دائمًا أسفل الـ Sidebar | يُنقل لمكان مناسب داخل Profile أو Home |

---

## 6. UI States المطلوبة

| الحالة | الوصف |
|---|---|
| Loading | Skeleton للكروت والرسوم البيانية أثناء تحميل البيانات المالية |
| Empty | حالة "لا توجد معاملات/حسابات/أهداف بعد" مع CTA لإضافة أول عنصر |
| Error | فشل تحميل البيانات المالية (خطأ اتصال) |
| Success | تأكيد نجاح إضافة معاملة/حساب/تحويل (Toast) |
| Positive/Negative Indicator | يجب أن يعكس أي رقم نسبة مئوية لونه تلقائيًا (أخضر لو موجب، أحمر لو سالب) في كل الشاشة |
| Disabled | زر الحفظ معطل لو الفورم غير مكتمل (مثال: Add Transaction بدون مبلغ) |
| Hidden Balance | حالة خاصة بهذا التطبيق: عند الضغط على أيقونة العين، الرصيد يتحول لرموز مخفية (••••) بدل الرقم |
| Dark Mode | حالة كاملة للتطبيق (Theme) يجب أن تُطبق على كل الشاشات وليس الرئيسية فقط |

---

## 7. Development Notes / Constraints

1. **الألوان الدلالية للأرقام (أخضر=موجب/دخل، أحمر=سالب/مصروف) قاعدة صارمة** يجب تطبيقها في كل مكان بالتطبيق بدون استثناء — أي رقم مالي إيجابي أو دخل = أخضر، أي مصروف أو نسبة سلبية = أحمر.
2. **ألوان التصنيفات في الـ Donut Chart** (أصفر، أزرق، بنفسجي، رمادي...) منفصلة تمامًا عن نظام الألوان الدلالي أعلاه — لا تُستخدم للدلالة على موجب/سالب، فقط للتفريق البصري بين التصنيفات.
3. **إخفاء/إظهار الرصيد (Eye Icon)** خاصية أساسية على بطاقة الرصيد الرئيسية، يجب أن تُطبق كـ State قابل للتبديل ويفضل أن تُحفظ تفضيلات المستخدم (تذكر آخر حالة).
4. **Dark Mode** يجب بناؤه كنظام Theme متكامل من البداية (باستخدام CSS Variables/Tokens) وليس كصفحة منفصلة مكررة.
5. **الأرقام المالية** يجب أن تُنسّق دائمًا بفواصل الآلاف والعملة (EGP) بشكل متسق في كل الشاشة.
6. **مكون الجدول (Data Table)** يتكرر في 4 صفحات على الأقل (Transactions, Income, Expenses, Account Summary) — يجب بناؤه كـ Component واحد قابل لإعادة الاستخدام بإعدادات أعمدة مختلفة، وليس تكرار الكود.
7. **Sidebar/Bottom Navigation Active State** يجب أن يعكس المسار الفعلي الحالي (Route-based)، وليس Local State يدوي.

---

**نهاية المستند.**
هذا المستند تحليل بصري كامل للتصميم المرفق (Reference Images)، معد ليكون نقطة بداية لأي عمل تقني (Claude Code أو مطور بشري) على مشروع Money Tracking App.
