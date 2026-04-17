const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '../../data/one-dsd.db');
let _db = null;

async function getDb() {
  if (_db) return _db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(buf);
  } else {
    _db = new SQL.Database();
    await initSchema(_db);
  }
  return _db;
}

function saveDb() {
  if (!_db) return;
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, Buffer.from(_db.export()));
  } catch (e) { console.error('DB save error:', e.message); }
}

async function initSchema(db) {
  db.run(`PRAGMA journal_mode=WAL;`);
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
      full_name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'staff',
      department TEXT, idi_stage TEXT DEFAULT 'Denial', created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS equity_reviews (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, level TEXT DEFAULT 'scan',
      status TEXT DEFAULT 'in_progress', current_step INTEGER DEFAULT 1,
      step_data TEXT DEFAULT '{}', user_id TEXT,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS action_items (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, owner TEXT,
      status TEXT DEFAULT 'not_started', priority TEXT DEFAULT 'normal',
      progress INTEGER DEFAULT 0, due_date TEXT, goal_id TEXT, review_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, department TEXT,
      status TEXT DEFAULT 'open', priority TEXT DEFAULT 'normal',
      requester_id TEXT, assigned_to TEXT,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS operational_goals (
      id TEXT PRIMARY KEY, number INTEGER NOT NULL, title TEXT NOT NULL,
      description TEXT, weight INTEGER DEFAULT 15, base_progress INTEGER DEFAULT 0,
      target_date TEXT, status TEXT DEFAULT 'active'
    );
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT, description TEXT,
      content TEXT, is_featured INTEGER DEFAULT 0,
      authority_level TEXT DEFAULT 'internal', created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS community_profiles (
      id TEXT PRIMARY KEY, community_name TEXT NOT NULL, category TEXT,
      languages_json TEXT DEFAULT '[]', cultural_context TEXT,
      communication_guidance TEXT, trust_factors TEXT, service_considerations TEXT,
      contacts TEXT, strengths_json TEXT DEFAULT '[]', priority_flag INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS training_courses (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
      format TEXT DEFAULT 'self-paced', level TEXT DEFAULT 'foundational',
      idi_stage TEXT, duration_minutes INTEGER DEFAULT 60, is_required INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS training_progress (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, course_id TEXT NOT NULL,
      progress INTEGER DEFAULT 0, completed_at TEXT, updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS deia_topics (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, definition TEXT, dsd_relevance TEXT,
      frameworks TEXT, discussion_questions TEXT, tags_json TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS reflections (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, reflection_text TEXT NOT NULL,
      prompt_id TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS spaced_retrieval_prompts (
      id TEXT PRIMARY KEY, week_number INTEGER, prompt_text TEXT NOT NULL,
      idi_stage TEXT DEFAULT 'Minimization', active INTEGER DEFAULT 1, week_start TEXT
    );
    CREATE TABLE IF NOT EXISTS weekly_syntheses (
      id TEXT PRIMARY KEY, week_start TEXT NOT NULL, synthesis_text TEXT NOT NULL,
      week_number INTEGER, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS agent_definitions (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, autonomy TEXT DEFAULT 'supervised',
      approval_gate TEXT DEFAULT 'mandatory', config_json TEXT DEFAULT '{}',
      is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS learning_loop_proposals (
      id TEXT PRIMARY KEY, trigger_pattern TEXT NOT NULL, suggested_change TEXT,
      lint_score INTEGER DEFAULT 85, status TEXT DEFAULT 'pending',
      proposed_by TEXT, decided_by TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS approval_queue (
      id TEXT PRIMARY KEY, item_type TEXT NOT NULL, item_id TEXT NOT NULL,
      title TEXT NOT NULL, content TEXT, status TEXT DEFAULT 'pending',
      created_by TEXT, created_at TEXT DEFAULT (datetime('now')), decided_at TEXT
    );
    CREATE TABLE IF NOT EXISTS consultant_documents (
      id TEXT PRIMARY KEY, filename TEXT NOT NULL, file_type TEXT,
      classification TEXT DEFAULT 'reference', routing_destination TEXT DEFAULT 'knowledge_base',
      storage_path TEXT, authority_level TEXT DEFAULT 'internal', version TEXT,
      upload_date TEXT, approved INTEGER DEFAULT 0, usage_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY, event_type TEXT NOT NULL, details TEXT,
      agent_id TEXT, user_id TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS working_groups (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, initiative TEXT,
      status TEXT DEFAULT 'active', findings_summary TEXT, members_json TEXT DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS odet_records (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, record_type TEXT,
      status TEXT DEFAULT 'active', notes TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS equity_team (
      id TEXT PRIMARY KEY, full_name TEXT NOT NULL, charter_role TEXT,
      unit TEXT, email TEXT, joined_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS community_feedback (
      id TEXT PRIMARY KEY, feedback_text TEXT NOT NULL, attribution TEXT,
      community_tag TEXT, collection_cycle TEXT, sentiment TEXT DEFAULT 'neutral',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, event_date TEXT,
      event_type TEXT DEFAULT 'equity', description TEXT,
      location TEXT, is_recurring INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS team_activities (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT,
      duration_minutes INTEGER DEFAULT 30, equity_theme TEXT,
      materials TEXT DEFAULT 'None', instructions TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS cos_clusters (
      id TEXT PRIMARY KEY, cluster_id TEXT UNIQUE NOT NULL,
      cluster_type TEXT DEFAULT 'primary', color TEXT DEFAULT '#4A9EDB', description TEXT
    );
    CREATE TABLE IF NOT EXISTS cos_atoms (
      id TEXT PRIMARY KEY, atom_id TEXT UNIQUE NOT NULL, cluster_id TEXT,
      function_id TEXT, verb TEXT NOT NULL, object TEXT NOT NULL,
      stakeholder TEXT, mode TEXT, output TEXT, taxonomy TEXT,
      source_statement TEXT, agent_enabled INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS cos_outputs (
      id TEXT PRIMARY KEY, atom_id TEXT, title TEXT NOT NULL, content TEXT NOT NULL,
      status TEXT DEFAULT 'approved', created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS cos_approvals (
      id TEXT PRIMARY KEY, atom_id TEXT, atom_name TEXT, output_text TEXT,
      output_type TEXT DEFAULT 'text', status TEXT DEFAULT 'pending',
      revision_notes TEXT, requires_approval INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')), decided_at TEXT
    );
  `);

  await seedData(db);
}

async function seedData(db) {
  // Users
  const pw1 = bcrypt.hashSync('equity2026!', 10);
  const pw2 = bcrypt.hashSync('password123', 10);
  db.run(`INSERT OR IGNORE INTO users VALUES (?,?,?,?,?,?,?,datetime('now'))`,
    ['user-consultant-1','gbanks',pw1,'Gary Banks','equity_lead','Disability Services Division','Adaptation']);
  db.run(`INSERT OR IGNORE INTO users VALUES (?,?,?,?,?,?,?,datetime('now'))`,
    ['user-staff-1','staff1',pw2,'Staff One','staff','DSD Programs','Minimization']);
  db.run(`INSERT OR IGNORE INTO users VALUES (?,?,?,?,?,?,?,datetime('now'))`,
    ['user-staff-2','staff2',pw2,'Staff Two','staff','DSD Operations','Denial']);

  // Operational Goals
  const goals = [
    ['goal-1',1,'Increase Culturally Responsive Service Delivery','Improve CLAS Standard compliance across all DSD programs',20,35,'2026-09-30','active'],
    ['goal-2',2,'Build Staff Equity Competency','IDI-informed training for 80% of DSD staff by Q4',15,42,'2026-12-31','active'],
    ['goal-3',3,'Reduce Service Disparities','Close access gaps for priority populations',20,28,'2026-12-31','active'],
    ['goal-4',4,'Strengthen Community Partnerships','Active partnerships with 10+ community organizations',15,55,'2026-09-30','active'],
    ['goal-5',5,'Operationalize Equity Infrastructure','Embed equity into all DSD business processes',15,60,'2026-06-30','active'],
    ['goal-6',6,'Expand Language Access','Ensure language access for 95% of service interactions',15,70,'2026-12-31','active'],
  ];
  goals.forEach(g => db.run(`INSERT OR IGNORE INTO operational_goals VALUES (?,?,?,?,?,?,?,?)`, g));

  // Consultations
  const consults = [
    ['cons-1','PCA Provider Rate Changes — Equity Impact','How will the proposed rate changes affect providers serving Somali and Hmong communities?','DSD Policy','open','urgent','user-staff-1',null],
    ['cons-2','MnCHOICES Assessment Cultural Adaptation','Tools need cultural adaptation for Indigenous communities in greater MN','DSD Assessment','in_progress','high','user-staff-2','user-consultant-1'],
    ['cons-3','HCBS Waiver Application Barriers','Families are dropping out of the application process — language and navigation barriers','DSD Waivers','open','high','user-staff-1',null],
  ];
  consults.forEach(c => db.run(`INSERT OR IGNORE INTO consultations (id,title,description,department,status,priority,requester_id,assigned_to,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))`, c));

  // Action Items
  const actions = [
    ['act-1','Complete IDI Group Profile for DSD Leadership Team','Administer IDI and debrief with senior leadership','gbanks','in_progress','high',65,'2026-04-15','goal-2'],
    ['act-2','Develop Somali Community Resource Guide','Partner with Somali community liaisons to create navigable guide','gbanks','not_started','high',0,'2026-05-01','goal-1'],
    ['act-3','Audit HCBS Waiver Forms for Plain Language','Review all 23 forms for 8th grade reading level','gbanks','in_progress','normal',40,'2026-04-30','goal-3'],
    ['act-4','Establish Hmong Advisory Circle','Recruit 8-10 Hmong community members for quarterly advisory','gbanks','not_started','normal',0,'2026-06-30','goal-4'],
    ['act-5','Create Equity Analysis Toolkit Training','eLearning module for DHS Equity Analysis Toolkit (FARM)','gbanks','in_progress','high',75,'2026-04-01','goal-5'],
    ['act-6','Translate MnCHOICES Outreach Materials','Priority: Somali, Hmong, Spanish, Ojibwe','gbanks','not_started','high',0,'2026-05-15','goal-6'],
  ];
  actions.forEach(a => db.run(`INSERT OR IGNORE INTO action_items (id,title,description,owner,status,priority,progress,due_date,goal_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,datetime('now'))`, a));

  // Resources — includes Hofstede "Cultures and Organizations: Software of the Mind"
  const resources = [
    ['res-1','DHS Equity Analysis Toolkit (FARM)','equity_toolkit','Fairness, Access, Representation, Multicultural Competency framework','The FARM framework guides equity analysis across DHS programs. Use for policy review, program design, and resource allocation decisions.',1],
    ['res-2','CLAS Standards Reference Guide','clas','National Standards for Culturally and Linguistically Appropriate Services (1-15)','The 15 CLAS Standards cover: Principal Standard (1), Governance Leadership and Workforce (2-4), Communication and Language Assistance (5-8), and Engagement, Continuous Improvement and Accountability (9-15).',1],
    ['res-3','Disability Justice Principles','disability_justice','Ten principles of disability justice from Sins Invalid','The ten principles are: Intersectionality, Leadership of Most Impacted, Anti-Capitalist Politics, Cross-Movement Solidarity, Recognizing Wholeness, Sustainability, Cross-Disability Solidarity, Interdependence, Collective Access, Collective Liberation.',1],
    ['res-4','ADA Title II Compliance Guide','ada','Federal requirements for state and local government disability services','Title II prohibits discrimination against qualified individuals with disabilities in all programs, activities, and services of public entities.',1],
    ['res-5','IDI Assessment Framework','training','Intercultural Development Inventory stages and progression','The IDI measures orientation toward cultural difference along the Intercultural Development Continuum: Denial, Polarization, Minimization, Acceptance, and Adaptation.',0],
    ['res-6','GARE Racial Equity Framework','equity_toolkit','Government Alliance on Race and Equity framework','GARE: Normalize (regular conversations about race), Organize (institutional commitment), Operationalize (implement tools and processes).',0],
    ['res-7','Universal Design for Learning Guide','ada','UDL principles for accessible program design','UDL principles: Multiple Means of Engagement (why), Multiple Means of Representation (what), Multiple Means of Action and Expression (how).',0],
    ['res-8','Cultural Humility Reference','community','Understanding cultural humility in DSD practice',"Cultural humility is a lifelong process of self-reflection and learning that acknowledges the limits of one's knowledge and centers the other person's expertise about their own experience.",0],
  ];
  // Add Hofstede book as a resource
  const hofstedeContent = "Hofstede six cultural dimensions: (1) Power Distance Index: degree of inequality accepted. (2) Individualism vs Collectivism: individual vs group integration. (3) Masculinity vs Femininity: assertiveness vs modesty. (4) Uncertainty Avoidance: tolerance for ambiguity. (5) Long vs Short Term Orientation: future vs present values. (6) Indulgence vs Restraint: gratification of desires. Applied to DSD practice: Scandinavian-heritage MN communities score high on low power distance and individualism. Somali and Hmong communities tend toward high power distance and collectivism meaning family and clan leaders must be engaged, not bypassed. Disability communities vary widely. Use these dimensions to design culturally responsive services without stereotyping.";
  db.run("INSERT OR IGNORE INTO resources (id,title,category,description,content,is_featured,authority_level,created_at) VALUES (?,?,?,?,?,?,?,datetime('now'))",
    ["res-9","Cultures and Organizations: Software of the Mind (Hofstede)","community",
     "Geert Hofstede cross-cultural dimensions framework: Power Distance, Individualism vs Collectivism, Masculinity vs Femininity, Uncertainty Avoidance, Long-Term Orientation, Indulgence vs Restraint.",
     hofstedeContent, 1, "external"]);

  resources.forEach(r => db.run(`INSERT OR IGNORE INTO resources (id,title,category,description,content,is_featured,authority_level,created_at) VALUES (?,?,?,?,?,?,'internal',datetime('now'))`, r));

  // Community Profiles — Restored from original source data (30 profiles)
  // All 30 profiles include: cultural context, communication guidance, trust factors, community strengths
  // priority_flag=0 for all: universal service, no population ranked above another

  db.run("DELETE FROM community_profiles");

  const profiles = [
    // ── 11 TRIBAL NATIONS ──────────────────────────────────────────────────────
    ["cp-t01","Bois Forte Band of Chippewa","Tribal Nation",JSON.stringify(["Ojibwe","English"]),
     "Sovereign nation in northeastern MN. Three reservations: Nett Lake, Vermilion Lake, Deer Creek. Wild rice, fishing, and gaming economies.",
     "Tribal consultation required before any services on reservation. Respect sovereignty — they are a government. Engage through tribal social services. Government-to-government protocol.",
     "Trust through Bois Forte Band Social Services. Formal government-to-government relationship required for any program engagement.",
     JSON.stringify(["Wild rice and fishing traditions","Language revitalization programs","Gaming revenue funds social programs","Strong land connection","Tribal social services infrastructure"]),0],
    ["cp-t02","Fond du Lac Band of Lake Superior Chippewa","Tribal Nation",JSON.stringify(["Ojibwe","English"]),
     "Sovereign nation near Cloquet MN. Fond du Lac Tribal and Community College. Strong language revitalization and healthcare infrastructure.",
     "Coordinate, do not duplicate tribal services. Government-to-government protocol. Fond du Lac has robust services — partner rather than replace.",
     "Trust through Fond du Lac Human Services and Band administration.",
     JSON.stringify(["Tribal college (FDLTCC)","Language revitalization leadership","Strong healthcare system","Cultural preservation programs","Educational access"]),0],
    ["cp-t03","Grand Portage Band of Lake Superior Chippewa","Tribal Nation",JSON.stringify(["Ojibwe","English"]),
     "Northernmost MN reservation on Lake Superior. Small community (~300 residents). Strong cultural preservation. Grand Portage National Monument.",
     "Remote location requires flexible service delivery. Small close-knit community with deep cultural practices. Tribal consultation essential.",
     "Trust through Grand Portage Tribal Council and Human Services.",
     JSON.stringify(["Cultural stewardship of Grand Portage site","Strong traditional practices","Close-knit community support systems","Lake Superior cultural connection"]),0],
    ["cp-t04","Leech Lake Band of Ojibwe","Tribal Nation",JSON.stringify(["Ojibwe","English"]),
     "Largest land base in MN. Walker area. High poverty rates, significant unmet need. Leech Lake Tribal College. Complex jurisdictional history with state.",
     "Do not assume state services apply on tribal land. Jurisdictional complexities require legal clarity. Work exclusively through tribal social services.",
     "Trust through Leech Lake Division of Social Services.",
     JSON.stringify(["Largest Ojibwe land base in MN","Leech Lake Tribal College","Cultural programs","Fishing and wild rice traditions","Community resilience"]),0],
    ["cp-t05","Mille Lacs Band of Ojibwe","Tribal Nation",JSON.stringify(["Ojibwe","English"]),
     "Central MN. Strong cultural revitalization. Significant legal victories on treaty rights. Grand Casino Mille Lacs. Active in state policy.",
     "Government-to-government required. Mille Lacs has sophisticated governance and policy capacity. Coordinate formally.",
     "Trust through Mille Lacs Band Social Services and District representatives.",
     JSON.stringify(["Treaty rights legal victories","Cultural revitalization leadership","Language programs","Policy advocacy sophistication","Casino revenue for services"]),0],
    ["cp-t06","White Earth Nation","Tribal Nation",JSON.stringify(["Ojibwe","English"]),
     "Largest MN tribal enrollment. Northwestern MN. High poverty, significant urban diaspora in Twin Cities. Active food sovereignty movement.",
     "Significant urban White Earth members need Twin Cities services. Coordinate with urban Indian programs. Government-to-government for reservation-based services.",
     "Trust through White Earth Social Services and urban programs like NABS.",
     JSON.stringify(["Food sovereignty movement leadership","Language programs","Largest tribal enrollment in MN","Cultural leadership","Urban and reservation community networks"]),0],
    ["cp-t07","Red Lake Nation","Tribal Nation",JSON.stringify(["Ojibwe","English"]),
     "Closed reservation — one of few remaining in US. Non-ceded land, full tribal jurisdiction. Northwestern MN. Highly sovereign.",
     "Closed reservation means zero state jurisdiction. All services through tribal systems only. Deep respect for full sovereignty required. No state services without invitation.",
     "Trust through Red Lake Social Services exclusively.",
     JSON.stringify(["Full sovereignty and closed reservation status","Strong cultural preservation","Red Lake walleye fishery","Community self-determination"]),0],
    ["cp-t08","Lower Sioux Indian Community","Tribal Nation",JSON.stringify(["Dakota","English"]),
     "Dakota nation near Morton MN. Descended from survivors of 1862 Dakota War and forced removal. Jackpot Junction Casino funds services.",
     "Acknowledge 1862 Dakota War history and forced removal. Dakota sovereignty distinct from Ojibwe. Government-to-government protocol required.",
     "Trust through Lower Sioux Social Services and Tribal Council.",
     JSON.stringify(["Cultural resilience after 1862 forced removal","Dakota language revitalization","Casino revenue for community services","Historical survival and persistence"]),0],
    ["cp-t09","Upper Sioux Community","Tribal Nation",JSON.stringify(["Dakota","English"]),
     "Small Dakota community near Granite Falls MN. Pejuhutazizi Oyate (Yellow Medicine). Strong cultural revival.",
     "Small community with strong cultural programming. Government-to-government required. Acknowledge Dakota history.",
     "Trust through Upper Sioux Community Tribal Council.",
     JSON.stringify(["Cultural revival programs","Dakota language programs","Small close-knit community","Yellow Medicine cultural connection"]),0],
    ["cp-t10","Prairie Island Indian Community","Tribal Nation",JSON.stringify(["Dakota","English"]),
     "Dakota community on Prairie Island near Red Wing MN. Adjacent to nuclear plant — significant environmental justice concerns. Xcel Energy negotiations.",
     "Environmental justice is central concern. Nuclear plant proximity must be acknowledged in any health or risk work. Government-to-government required.",
     "Trust through Prairie Island Tribal Council.",
     JSON.stringify(["Environmental justice advocacy leadership","Cultural resilience","Xcel Energy negotiation capacity","Cultural programs","Advocacy infrastructure"]),0],
    ["cp-t11","Shakopee Mdewakanton Sioux Community","Tribal Nation",JSON.stringify(["Dakota","English"]),
     "Mystic Lake Casino near Prior Lake. Provides significant philanthropy to other tribes and Native organizations. Small enrollment with substantial resources.",
     "Small community with significant financial resources. Government-to-government protocol. Strong philanthropic role in Native community.",
     "Trust through Shakopee Mdewakanton Tribal Council.",
     JSON.stringify(["Mystic Lake Casino revenue","Tribal philanthropy leadership","Model tribal services","Cultural programs","Support for other Native organizations"]),0],
    // ── URBAN INDIGENOUS ───────────────────────────────────────────────────────
    ["cp-u01","Urban Native Communities (Twin Cities)","Urban Indigenous",JSON.stringify(["English","Ojibwe","Dakota"]),
     "Minneapolis/St. Paul has one of largest urban Native populations in US. Multi-tribal, diverse nations. American Indian Movement (AIM) founded here in 1968. Heart of the Earth School. Strong pan-Indigenous identity.",
     "Do not assume tribal affiliation. Urban Natives maintain strong cultural identity. AIM history is essential context. Many experience compounded displacement from both homelands and urban gentrification.",
     "Trust through Little Earth of United Tribes, American Indian Center, NABS, All Nations Indian Church, Franklin Avenue corridor organizations.",
     JSON.stringify(["AIM founding legacy","Urban cultural institutions","Political advocacy tradition","Multi-tribal solidarity","Community resilience","Franklin Ave community infrastructure"]),0],
    // ── AFRICAN AMERICAN ───────────────────────────────────────────────────────
    ["cp-aa01","African American Minnesotans","African American",JSON.stringify(["English"]),
     "Deep roots in MN. Rondo neighborhood destruction by I-94 in 1960s is defining community trauma. Significant disparities in all social determinants. North Minneapolis as cultural hub. NAACP, Urban League established.",
     "Acknowledge Rondo and I-94 history. Institutional racism is documented, not perceived. Church networks are primary trust institutions. Asset-based engagement required. Do not deficit-frame.",
     "Trust through NAACP Minnesota, Urban League Twin Cities, North Minneapolis community organizations, historically Black churches, African American Family Services.",
     JSON.stringify(["Cultural institutions in North Minneapolis","Strong church networks","Political advocacy tradition","HBCU alumni networks","Entrepreneurship in North Minneapolis","Cultural arts and music heritage"]),0],
    // ── EAST AFRICAN ───────────────────────────────────────────────────────────
    ["cp-ea01","Somali Community","East African",JSON.stringify(["Somali","English","Arabic"]),
     "Largest Somali population in US — estimated 100,000+ in MN. Cedar-Riverside (Little Mogadishu). Clan-based social structure. Islamic faith central. Strong oral tradition. Oral poetry (gabay) highly valued.",
     "Clan structure influences relationships — understand which clans have tensions. Gender considerations in service delivery. Oral tradition means in-person communication is essential. Ramadan scheduling matters. Interpreters must match dialect.",
     "Trust through Confederation of Somali Community in MN, Brian Coyle Community Center, Ka Joog, Somali Museum, mosque networks.",
     JSON.stringify(["Entrepreneurship on Cedar Ave","Strong mutual aid systems","Cultural institutions including Somali Museum","Youth organizations (Ka Joog)","Growing political representation","Oral poetry and arts tradition"]),0],
    ["cp-ea02","Oromo Community","East African",JSON.stringify(["Oromo","Amharic","English"]),
     "Fastest-growing East African community in MN. Oromo are largest ethnic group in Ethiopia but historically politically marginalized. Distinct from Ethiopian/Amhara identity. Many fled Oromo Liberation Front conflict.",
     "Oromo is distinct from Ethiopian — do not conflate. Oromo identity is politically significant. Avoid conflating with Amhara/Ethiopian Orthodox identity. Oromo language distinct from Amharic.",
     "Trust through Oromo Community of Minnesota, mosques, and emerging community organizations.",
     JSON.stringify(["Strong cultural identity","Growing political voice","Youth civic engagement","Language preservation efforts","Oromo cultural traditions"]),0],
    ["cp-ea03","Ethiopian and Eritrean Community","East African",JSON.stringify(["Amharic","Tigrinya","English"]),
     "Significant MN presence. Orthodox Christian majority with Muslim minority. Coffee ceremony as cultural institution. Multiple ethnic groups (Amhara, Tigrayan, Oromo). Eritrean community distinct from Ethiopian.",
     "Do not treat as monolithic. Eritrean is distinct from Ethiopian — significant political history between the countries. Tigray conflict has created intra-community tensions. Multiple languages required.",
     "Trust through Ethiopian Community of Minnesota (ECIM), Eritrean community organizations, Orthodox churches.",
     JSON.stringify(["Cultural institutions","Coffee ceremony as community building","Professional networks","Educational attainment","Orthodox church infrastructure","Cultural preservation"]),0],
    // ── SOUTHEAST ASIAN ────────────────────────────────────────────────────────
    ["cp-sa01","Hmong Community","Southeast Asian",JSON.stringify(["Hmong","English"]),
     "Second-largest Hmong population in US (80,000–100,000 in MN). 18 clans structure all social life. Secret War in Laos created refugee experience. Oral tradition — written Hmong developed in 20th century. Paj ntaub story cloths preserve history.",
     "Clan elders and structure are decision-makers. Never use family as interpreters. Elders may not be literate in Hmong or English. Mental health concepts require cultural adaptation. Clan relationships affect who can work together.",
     "Trust through Hmong American Partnership, Lao Family Community, Hmong Cultural Center, CAPI USA, Association for Advancement of Hmong Women.",
     JSON.stringify(["Clan mutual aid systems","Agricultural traditions","Cultural arts — story cloths paj ntaub","Growing political representation","Entrepreneurship","Youth civic engagement","Oral history preservation"]),0],
    ["cp-sa02","Karen Refugee Community","Southeast Asian",JSON.stringify(["Karen","Burmese","English"]),
     "Largest Karen population in US (20,000–30,000 in MN). Fled ethnic persecution in Myanmar. Many spent years in Thai refugee camps. Baptist Christian majority. Concentrated in St. Paul.",
     "Karen is distinct from Burmese — different language, culture, religion. Baptist churches are central community institutions. Significant trauma from ethnic persecution. Many arrived with limited formal education.",
     "Trust through Karen Organization of Minnesota, Baptist churches, International Institute of MN.",
     JSON.stringify(["Tight community networks","Baptist church infrastructure","Cultural resilience","Growing youth civic engagement","Community organizations","Cultural arts"]),0],
    ["cp-sa03","Vietnamese Community","Southeast Asian",JSON.stringify(["Vietnamese","English"]),
     "Long-established MN community, many arrived as post-war refugees. Confucian values of family and hierarchy. Buddhist and Catholic traditions. Diverse by generation.",
     "Respect hierarchy and elders in communication. Family involvement expected in decisions. Strong community organizations in Twin Cities.",
     "Trust through Vietnamese Social Services, Vietnamese American Association, Buddhist temples, Catholic parishes.",
     JSON.stringify(["Business community in Twin Cities","Educational attainment","Cultural organizations","Multigenerational community infrastructure","Vietnamese Arts Festival"]),0],
    // ── FILIPINO ───────────────────────────────────────────────────────────────
    ["cp-f01","Filipino Minnesotans","Southeast Asian / Pacific",JSON.stringify(["English","Tagalog","Ilocano","Visayan"]),
     "Strong family networks (bayanihan communal unity). High educational attainment. Backbone of MN healthcare workforce — nurses, caregivers, healthcare aides. Colonial history with Spain and US shapes identity complexity.",
     "Model minority myth masks real barriers. Healthcare worker burnout is significant. Colonial identity dynamics — recognize without reinforcing. Immigration complexity for some community members.",
     "Trust through Filipino American Association of Minneapolis, Philippine Cultural Foundation, healthcare professional networks.",
     JSON.stringify(["Bayanihan communal tradition","Healthcare workforce contributions — largest Filipino-American nursing community in MN","Educational attainment","Strong family networks","Cultural arts and festivals"]),0],
    // ── LATIN AMERICAN ─────────────────────────────────────────────────────────
    ["cp-la01","Latino/a/x Minnesotans","Latin American",JSON.stringify(["Spanish","English","Mayan Languages"]),
     "Fastest-growing MN demographic. Mexican, Puerto Rican, Central American, South American backgrounds. Significant agricultural worker population outstate. Familismo and personalismo central values. Catholic and Evangelical traditions.",
     "Significant internal diversity — do not treat as monolithic. Undocumented population has profound government contact fears. Guatemalan Mayan language speakers need specialized interpretation. Familismo means family in every decision.",
     "Trust through CLUES, Centro de Trabajadores Unidos, Navigate MN, Latino Economic Development Center, Catholic Charities.",
     JSON.stringify(["Growing political power","Agricultural community leadership","Business sector growth","Strong family networks","Cultural institutions","Youth civic engagement"]),0],
    // ── LGBTQ+ ─────────────────────────────────────────────────────────────────
    ["cp-q01","LGBTQ+ Communities (all backgrounds)","Cross-cutting Identity",JSON.stringify(["All languages"]),
     "Cross-cutting identity present in every racial and ethnic community. Highest service gaps for Trans/NB people. Widest compounded gaps for Black/AIAN LGBTQ+. MN has strong LGBTQ+ legal protections but significant rural gaps.",
     "Include LGBTQ+ analysis in every equity review. Affirming language always. LGBTQ+-competent providers required. Address compounded identity disparities. Rural isolation is a significant unmet need.",
     "Trust through OutFront MN, Rainbow Health, Trans Lifeline, PFLAG Minnesota, JustUs Health.",
     JSON.stringify(["Community solidarity networks","Advocacy organizations (OutFront MN)","Cultural resilience","Intersectional awareness","Youth leadership","Chosen family networks","Legal protections in MN"]),0],
    // ── EUROPEAN HERITAGE ──────────────────────────────────────────────────────
    ["cp-eu01","German-heritage Minnesotans","European Heritage",JSON.stringify(["English","German (heritage)"]),
     "Largest single-ancestry group historically in MN. Heritage preserved in New Ulm and Stearns County. Anti-German sentiment during WWI suppressed language and culture. Strong rural agricultural base.",
     "Stoicism may prevent help-seeking. Rural service gaps are real and significant. Mental health reluctance. May not see equity relevance — frame equity as fairness. Class and rural disadvantage often masked by perceived whiteness.",
     "Trust through Germanic-American Institute, rural church networks, New Ulm community organizations, agricultural extension services.",
     JSON.stringify(["Deep agricultural traditions","Strong community institutions","Church networks","Brewing and culinary heritage","Civic participation tradition","Rural cooperative traditions"]),0],
    ["cp-eu02","Swedish-heritage Minnesotans","European Heritage",JSON.stringify(["English","Swedish (heritage)"]),
     "One of highest per-capita Swedish ancestry populations in US. American Swedish Institute in Minneapolis. Cooperative economics tradition. Strong cultural institutions. Northern Minnesota presence.",
     "Cultural reserve and indirect communication style. Northern MN geographic isolation. Aging demographics in many communities. May not see equity relevance — connect to Scandinavian fairness values.",
     "Trust through American Swedish Institute, Gammelgården Museum, Gustavus Adolphus College, Lutheran church networks.",
     JSON.stringify(["Cooperative economics tradition","Civic engagement","Educational investment","Environmental stewardship","Cultural institutions (American Swedish Institute)","Egalitarian values"]),0],
    ["cp-eu03","Norwegian-heritage Minnesotans","European Heritage",JSON.stringify(["English","Norwegian (heritage)"]),
     "One of highest per-capita Norwegian ancestry populations in US. Sons of Norway, Norway House. Strong rural and farming community base. Egalitarian cooperative values.",
     "Cultural reserve and indirect communication. Rural isolation significant. Aging demographics in farming communities. May not self-identify as needing equity services.",
     "Trust through Sons of Norway, Vesterheim Museum, Norway House, Lutheran church networks.",
     JSON.stringify(["Cooperative and egalitarian traditions","Deep rural community ties","Cultural organizations (Norway House)","Public service tradition","Vesterheim cultural stewardship"]),0],
    // ── EASTERN EUROPEAN ───────────────────────────────────────────────────────
    ["cp-ee01","Ukrainian Minnesotans","Eastern European",JSON.stringify(["Ukrainian","Russian","English"]),
     "Growing community with significant recent arrivals fleeing war. Active churches and cultural organizations. Entrepreneurial spirit. Strong cultural identity intensified by ongoing conflict.",
     "Acknowledge ongoing war and displacement trauma. Distinguish Ukrainian from Russian identity — this is politically essential and non-negotiable. Recent arrivals face language barriers. Mixed documentation status.",
     "Trust through Ukrainian American Community Center, Ukrainian Catholic and Orthodox churches, refugee resettlement agencies.",
     JSON.stringify(["Strong cultural identity","Active community organizations","Entrepreneurial spirit","Educational emphasis","Cultural resilience","Community solidarity during wartime"]),0],
    ["cp-ee02","Russian-speaking Minnesotans","Eastern European",JSON.stringify(["Russian","English"]),
     "Diverse community including ethnic Russians, Jewish emigrants, Central Asian immigrants. High educational and scientific/technical workforce presence. Literary and artistic traditions.",
     "Significant internal diversity — do not assume political positions. Soviet-era deep distrust of government is real, valid, and persistent. Elder isolation in some communities. Jewish community has distinct needs.",
     "Trust through Russian cultural centers, Orthodox churches, Jewish Community Action.",
     JSON.stringify(["High educational attainment","Strong scientific/technical workforce","Literary and artistic traditions","Community networks","Immigration resourcefulness"]),0],
    // ── MENA ───────────────────────────────────────────────────────────────────
    ["cp-mena01","Arab/MENA Minnesotans","Middle Eastern / North African",JSON.stringify(["Arabic","English","Farsi","Kurdish"]),
     "Diverse communities from Lebanon, Syria, Iraq, Egypt, Yemen and North Africa. Multi-generational Twin Cities presence. New Arab American Theater Works. Strong hospitality and entrepreneurship traditions.",
     "Post-9/11 discrimination and surveillance has created profound government distrust. Immense internal diversity — do not treat as monolithic. No federal census MENA category causes invisibility. Do not conflate Arab with Muslim.",
     "Trust through Arab community organizations, New Arab American Theater Works, Islamic Center of MN, Arabic-speaking service providers.",
     JSON.stringify(["Strong family bonds","Hospitality tradition","Entrepreneurship","High educational attainment in many communities","Diverse faith traditions (Muslim and Christian)","Cultural arts"]),0],
    // ── PACIFIC ISLANDER ───────────────────────────────────────────────────────
    ["cp-pi01","Native Hawaiian and Pacific Islander (NHPI)","Pacific Islander",JSON.stringify(["English","Samoan","Tagalog","Hawaiian"]),
     "Small but growing MN community. Samoan, Tongan, and other Pacific Islander groups. Military service tradition. US colonial relationship with Hawaii and Pacific territories.",
     "Distinct from Asian — do not aggregate with Asian data (causes invisibility in AAPI categories). US colonial history must be acknowledged. Strong church communities. Extended family systems (aiga for Samoans).",
     "Trust through NHPI community organizations, Samoan churches, Pacific Islander community networks.",
     JSON.stringify(["Military service tradition","Strong extended family systems (aiga)","Cultural resilience","Community organizations","Cultural arts and performance"]),0],
    // ── WEST AFRICAN ───────────────────────────────────────────────────────────
    ["cp-wa01","West African Minnesotans","West African",JSON.stringify(["French","English","Wolof","Twi","Yoruba"]),
     "Growing community from Liberia, Nigeria, Ghana, Senegal, Guinea. Mix of refugees (Liberia) and professional/student immigrants. Brooklyn Park and Brooklyn Center concentrations.",
     "Significant internal diversity — 54+ countries represented. Do not treat as monolithic. French-speaking communities (Senegalese, Guinean) need French interpretation. Liberian refugee experience distinct from Nigerian professional immigration.",
     "Trust through Organization of Liberians in MN, African Immigrant Community Services, West African faith communities.",
     JSON.stringify(["Healthcare workforce presence (especially Liberian community)","Educational attainment","Entrepreneurship","Diverse faith traditions","Cultural arts","Community resilience"]),0],
  ];

  profiles.forEach(([id,community_name,category,languages_json,cultural_context,communication_guidance,trust_factors,strengths_json,priority_flag]) =>
    db.run(
      `INSERT OR REPLACE INTO community_profiles (id,community_name,category,languages_json,cultural_context,communication_guidance,trust_factors,strengths_json,priority_flag,created_at) VALUES (?,?,?,?,?,?,?,?,?,datetime('now'))`,
      [id,community_name,category,languages_json,cultural_context,communication_guidance,trust_factors,strengths_json,priority_flag]
    )
  );

  // Training Courses
  const courses = [
    ['tc-1','Understanding Racism in America','Survey course on structural racism and its impact on disability services','self-paced','foundational','Denial',90,1],
    ['tc-2','Intercultural Development Inventory (IDI) Orientation','Introduction to IDI framework and your personal developmental orientation','facilitated','foundational','Minimization',60,1],
    ['tc-3','CLAS Standards in Practice','Applying the 15 National CLAS Standards in DSD program delivery','self-paced','intermediate','Minimization',120,0],
    ['tc-4','Disability Justice Framework','Ten principles of disability justice and application in government services','self-paced','foundational','Acceptance',90,0],
    ['tc-5','Cultural Humility in Service Delivery','Moving from cultural competence to cultural humility in practice','facilitated','intermediate','Acceptance',120,0],
    ['tc-6','Equity Analysis Toolkit (FARM)','Using the DHS Equity Analysis Toolkit for program and policy review','self-paced','advanced','Adaptation',180,1],
  ];
  courses.forEach(c => db.run(`INSERT OR IGNORE INTO training_courses (id,title,description,format,level,idi_stage,duration_minutes,is_required) VALUES (?,?,?,?,?,?,?,?)`, c));

  // Training Progress for gbanks
  db.run(`INSERT OR IGNORE INTO training_progress VALUES (?,?,?,?,?,datetime('now'))`,
    ['tp-1','user-consultant-1','tc-1',100,'2026-01-15']);
  db.run(`INSERT OR IGNORE INTO training_progress VALUES (?,?,?,?,?,datetime('now'))`,
    ['tp-2','user-consultant-1','tc-2',100,'2026-02-01']);
  db.run(`INSERT OR IGNORE INTO training_progress VALUES (?,?,?,?,?,datetime('now'))`,
    ['tp-3','user-consultant-1','tc-6',75,null]);

  // DEIA Topics
  const topics = [
    ['topic-1','Intersectionality','The interconnected nature of social categorizations creating overlapping systems of discrimination','Disability, race, language, and immigration status intersect in DSD service delivery. A Somali woman with a disability faces compounded barriers.',JSON.stringify(['Crenshaw','Collins','critical race theory'])],
    ['topic-2','Cultural Humility','Lifelong process of self-reflection and learning about culture; different from cultural competence','Practitioners hold curiosity about each person rather than assuming knowledge based on group membership.',JSON.stringify(['Tervalon & Murray-Garcia','Hooks','IDI'])],
    ['topic-3','Structural Racism','Cumulative and compounding effects of racial bias across institutions, history, and culture','Disparities in HCBS waiver approval rates across racial groups reflect structural factors, not individual choices.',JSON.stringify(['GARE','Rothstein','Coates'])],
    ['topic-4','Disability Justice','Framework developed by disabled activists of color centering intersectionality and collective liberation','Goes beyond ADA compliance to address power, access, and interdependence in community.',JSON.stringify(['Sins Invalid','Mia Mingus','Leroy Moore'])],
    ['topic-5','Language Justice','The right of people to communicate in the language in which they think and feel most comfortable','CLAS Standards require language access services. This is a civil right, not a courtesy.',JSON.stringify(['CLAS Standards','EO 13166','Title VI'])],
  ];
  topics.forEach(t => db.run(`INSERT OR IGNORE INTO deia_topics (id,title,definition,dsd_relevance,frameworks,tags_json,created_at) VALUES (?,?,?,?,?,?,datetime('now'))`, [...t.slice(0,4), t[4], t[4], ]));

  // fix topic insert
  db.run('DELETE FROM deia_topics');
  topics.forEach(([id,title,definition,dsd_relevance,frameworks]) => db.run(
    `INSERT OR IGNORE INTO deia_topics (id,title,definition,dsd_relevance,frameworks,tags_json,created_at) VALUES (?,?,?,?,?,?,datetime('now'))`,
    [id,title,definition,dsd_relevance,frameworks,JSON.stringify([])]
  ));

  // Spaced Retrieval
  const prompts = [
    ['srp-1',1,'What are the 15 CLAS Standards and how do they apply to MnCHOICES?','Minimization'],
    ['srp-2',2,'Describe the five stages of the Intercultural Development Continuum and give an example of each.','Minimization'],
    ['srp-3',3,'How does intersectionality apply to a Hmong elder with a disability seeking HCBS services?','Acceptance'],
    ['srp-4',4,'What is the difference between language access and interpretation services?','Minimization'],
    ['srp-5',5,'Name three ways structural racism manifests in disability service systems.','Acceptance'],
  ];
  prompts.forEach(p => db.run(`INSERT OR IGNORE INTO spaced_retrieval_prompts (id,week_number,prompt_text,idi_stage,active) VALUES (?,?,?,?,1)`, p));

  // Weekly Synthesis
  db.run(`INSERT OR IGNORE INTO weekly_syntheses (id,week_start,synthesis_text,week_number,created_at) VALUES (?,?,?,?,datetime('now'))`,
    ['ws-1','2026-03-23',"This week's equity work centered on consultation support for the MnCHOICES assessment cultural adaptation project. Three consultations were triaged — one urgent (PCA provider rate changes), two high priority. Key insight: language access gaps are the most frequently cited barrier across all priority populations this quarter. Action: escalate language access plan to DSD leadership.",13]);

  // Agent Definitions
  const agents = [
    ['agent-1','Consultation Triage Agent','supervised','mandatory',JSON.stringify({model:'claude-sonnet-4-20250514',maxTokens:500}),1],
    ['agent-2','Equity Review Assistant','supervised','mandatory',JSON.stringify({model:'claude-sonnet-4-20250514',maxTokens:1024}),1],
    ['agent-3','Goal Decomposition Agent','supervised','mandatory',JSON.stringify({model:'claude-sonnet-4-20250514',maxTokens:1500}),1],
    ['agent-4','Learning Loop Agent','supervised','mandatory',JSON.stringify({model:'claude-sonnet-4-20250514',maxTokens:800}),1],
    ['agent-5','Quarterly Report Generator','supervised','mandatory',JSON.stringify({model:'claude-sonnet-4-20250514',maxTokens:3000}),1],
    ['agent-6','Document Classifier','supervised','mandatory',JSON.stringify({model:'claude-haiku-4-5-20251001',maxTokens:300}),1],
  ];
  agents.forEach(a => db.run(`INSERT OR IGNORE INTO agent_definitions (id,name,autonomy,approval_gate,config_json,is_active,created_at) VALUES (?,?,?,?,?,?,datetime('now'))`, a));

  // Learning Loop Proposals
  db.run(`INSERT OR IGNORE INTO learning_loop_proposals (id,trigger_pattern,suggested_change,lint_score,status,proposed_by,created_at) VALUES (?,?,?,?,?,?,datetime('now'))`,
    ['llp-1','Consultation volume spike in language access category','Add CLAS Standards 5-8 quick reference to consultant dashboard','92','pending','agent-4']);
  db.run(`INSERT OR IGNORE INTO learning_loop_proposals (id,trigger_pattern,suggested_change,lint_score,status,proposed_by,created_at) VALUES (?,?,?,?,?,?,datetime('now'))`,
    ['llp-2','Three consecutive IDI training completions in Denial stage','Recommend foundational anti-racism module sequencing adjustment','87','pending','agent-4']);

  // Approval Queue
  db.run(`INSERT OR IGNORE INTO approval_queue (id,item_type,item_id,title,content,status,created_by,created_at) VALUES (?,?,?,?,?,?,?,datetime('now'))`,
    ['aq-1','learning_loop_proposal','llp-1','Review: CLAS Standards Dashboard Addition','Add CLAS Standards 5-8 quick reference card to consultant dashboard sidebar. Estimated implementation: 2 hours.','pending','agent-4']);
  db.run(`INSERT OR IGNORE INTO approval_queue (id,item_type,item_id,title,content,status,created_by,created_at) VALUES (?,?,?,?,?,?,?,datetime('now'))`,
    ['aq-2','learning_loop_proposal','llp-2','Review: IDI Training Sequence Adjustment','Reorder foundational modules to front-load Understanding Racism content for Denial-stage learners.','pending','agent-4']);

  // Working Groups
  const wgs = [
    ['wg-1','Language Access Implementation Team','CLAS Standards 5-8 compliance across DSD','active','Currently mapping interpreter needs across all 150+ staff interactions monthly.'],
    ['wg-2','Indigenous Services Workgroup','Culturally responsive services for Minnesota Native Nations','active','Developing nation-specific service protocols in partnership with tribal social services.'],
    ['wg-3','Disability Justice Study Circle','Deepening disability justice framework literacy','active','Monthly 90-minute sessions using Sins Invalid curriculum.'],
    ['wg-4','Data Equity Subcommittee','Disaggregating DSD outcome data by race and disability type','active','Working with MNIT to build equity dashboards from existing data systems.'],
  ];
  wgs.forEach(w => db.run(`INSERT OR IGNORE INTO working_groups (id,name,initiative,status,findings_summary,members_json) VALUES (?,?,?,?,?,?)`, [...w, '[]']));

  // Equity Team
  const team = [
    ['et-1','Teresa vanderBent','Co-Lead, Language Access','DSD Programs'],
    ['et-2','Leigh Ann Ahmad','Co-Lead, Community Engagement','DSD Community Relations'],
    ['et-3','Carrie Jakober','Training Coordinator','DSD Workforce Development'],
    ['et-4','Leah Zoladkiewicz','Data & Accountability','DSD Quality Assurance'],
    ['et-5','Marcus Thompson','Indigenous Services Liaison','DSD Field Operations'],
    ['et-6','Amina Hassan','Somali Community Liaison','DSD Community Relations'],
    ['et-7','Cha Vang','Hmong Community Liaison','DSD Community Relations'],
    ['et-8','Rosa Medina','Latino Community Liaison','DSD Community Relations'],
    ['et-9','James Bear','Tribal Relations Coordinator','DSD Policy'],
    ['et-10','Sarah Kim','Disability Justice Advocate','DSD Self-Directed Services'],
  ];
  team.forEach(t => db.run(`INSERT OR IGNORE INTO equity_team (id,full_name,charter_role,unit,joined_at) VALUES (?,?,?,?,datetime('now'))`, t));

  // Community Feedback
  const feedback = [
    ['cf-1','The MnCHOICES assessment form was very confusing. My caseworker had to explain every question.','Anonymous','Somali Community','Q1 2026','negative'],
    ['cf-2','Finally someone asked us about our needs. The Hmong advisory meeting was very respectful.','Hmong Elder Council','Hmong Community','Q1 2026','positive'],
    ['cf-3','We need interpreters at every appointment, not just when we ask. We should not have to fight for this.','Self-Advocate','Disability Community','Q4 2025','negative'],
    ['cf-4','The new plain language materials are much better. My family can understand them now.','Parent','Latino/a/x Community','Q1 2026','positive'],
    ['cf-5','DSD staff do not understand tribal sovereignty. We are not a county. We are a nation.','Tribal Council Representative','Indigenous Nations','Q4 2025','negative'],
  ];
  feedback.forEach(f => db.run(`INSERT OR IGNORE INTO community_feedback (id,feedback_text,attribution,community_tag,collection_cycle,sentiment,created_at) VALUES (?,?,?,?,?,?,datetime('now'))`, f));

  // Calendar Events
  const events = [
    ['evt-1','One DSD Equity Team Monthly Meeting','2026-04-02','team_meeting','Monthly meeting of the One DSD equity volunteer team','DSD Conference Room B',1],
    ['evt-2','IDI Group Debrief — DSD Leadership','2026-04-08','training','Intercultural Development Inventory debrief session for senior leadership','DSD Executive Conference Room',0],
    ['evt-3','Hmong Advisory Circle — Inaugural Meeting','2026-04-10','community','First meeting of the Hmong Community Advisory Circle','Hmong American Partnership, St. Paul',0],
    ['evt-4','CLAS Standards Training — Cohort 1','2026-04-15','training','CLAS Standards 1-15 foundational training for DSD staff','Virtual/Teams',0],
    ['evt-5','Language Access Plan Presentation to Leadership','2026-04-22','presentation','Present draft Language Access Plan to DSD Deputy Commissioner','DSD Executive Conference Room',0],
    ['evt-6','One DSD Equity Program — Kickoff Session','2026-04-29','all_staff','All-staff equity program launch and orientation','DSD Main Conference Center',0],
    ['evt-7','IDI Coaching — Cohort 1 begins','2026-05-01','training','Individual IDI coaching sessions begin for first cohort of 15 staff','Virtual/Teams',0],
    ['evt-8','MN DEIA Summit — MHFA','2026-05-13','conference','Minnesota Department of Human Services DEIA Summit','DoubleTree by Hilton, Bloomington',0],
  ];
  events.forEach(e => db.run(`INSERT OR IGNORE INTO calendar_events (id,title,event_date,event_type,description,location,is_recurring) VALUES (?,?,?,?,?,?,?)`, e));

  // Team Activities
  const activities = [
    ['ta-1','Privilege Walk','reflection',30,'Power and Privilege','Paper cards with statements','Participants step forward or backward based on life experiences statements. Debrief focuses on how privilege and marginalization intersect.'],
    ['ta-2','Spectrum of Beliefs','dialogue',45,'Controversial Topics','None','Facilitator reads statements; participants move to agree/disagree spectrum. Builds capacity for dialogue on difficult equity topics.'],
    ['ta-3','Four Corners','values',20,'Core Values','4 posted signs (Strongly Agree, Agree, Disagree, Strongly Disagree)','Quick opinion polling activity to surface team diversity of thought on equity-related statements.'],
    ['ta-4','Fishbowl Discussion','dialogue',60,'Deep Listening','Chairs in concentric circles','Inner circle discusses topic while outer circle observes. Rotates. Builds listening and perspective-taking skills.'],
    ['ta-5','Identity Iceberg','identity',45,'Social Identity','Printed iceberg template','Participants map visible and invisible aspects of identity. Reveals how much of identity is below the surface.'],
    ['ta-6','Microaggression Case Studies','workplace',60,'Microaggressions','Case study handouts','Small groups analyze real DSD scenarios, identify microaggressions, and practice responses.'],
    ['ta-7','Community Asset Mapping','community',45,'Community Strengths','Large paper, markers','Teams map assets and resources in a priority community. Shifts from deficit to asset-based thinking.'],
    ['ta-8','Equity in Data Exercise','data equity',60,'Disaggregated Data','Dataset printouts','Teams analyze DSD program data disaggregated by race/disability. Identify disparities and hypothesize root causes.'],
  ];
  activities.forEach(a => db.run(`INSERT OR IGNORE INTO team_activities (id,title,category,duration_minutes,equity_theme,materials,instructions,created_at) VALUES (?,?,?,?,?,?,?,datetime('now'))`, a));

  // COS Clusters
  const clusters = [
    ['cl-1','Disparity Analysis','primary','#4A9EDB','Analyze service gaps, outcome disparities, and equity indicators across DSD programs'],
    ['cl-2','Consultation & Advisory','primary','#78BE21','Provide equity consultation to DSD units, managers, and front-line staff'],
    ['cl-3','Program Design Review','primary','#003865','Evaluate DSD programs for equity, accessibility, and cultural responsiveness'],
    ['cl-4','Training & Development','primary','#9B59B6','Design and deliver equity-focused learning experiences for DSD workforce'],
    ['cl-5','Community Engagement','primary','#E67E22','Build and maintain relationships with priority communities served by DSD'],
    ['cl-6','Learning & Capacity Building','secondary','#FB923C','Build equity competency through training, spaced retrieval, and learning loops'],
    ['cl-7','Strategic Communications','secondary','#4A9EDB','Communicate equity program progress, priorities, and impact'],
    ['cl-8','Agentic OS Management','primary','#E05252','Manage, approve, audit, and improve the AI agent infrastructure of the COS'],
    ['cl-9','Executive Advising','primary','#78BE21','Provide equity-informed strategic counsel to DSD leadership'],
  ];
  clusters.forEach(c => db.run(`INSERT OR IGNORE INTO cos_clusters (id,cluster_id,cluster_type,color,description) VALUES (?,?,?,?,?)`, c));

  // COS Atoms (sample — key ones)
  const atoms = [
    ['atom-d01','D.01','cl-1','D01','Analyze','disparity indicators','DSD leadership','quantitative','Disparity report','analysis','Conduct regular analysis of service outcome data disaggregated by race, disability, and other equity dimensions',0],
    ['atom-d02','D.02','cl-1','D02','Identify','root causes of disparity','Program managers','qualitative','Root cause analysis','synthesis','Apply root cause analysis frameworks to identify systemic factors driving observed disparities',0],
    ['atom-d03','D.03','cl-1','D03','Map','service access barriers','Community members','participatory','Barrier inventory','community','Document barriers experienced by priority populations in accessing DSD services',0],
    ['atom-c01','C.01','cl-2','C01','Triage','consultation requests','All DSD staff','advisory','Priority assessment','advisory','Assess and prioritize incoming consultation requests using urgency and impact criteria',1],
    ['atom-c02','C.02','cl-2','C02','Provide','CLAS Standards guidance','Program staff','advisory','CLAS recommendations','advisory','Advise on application of National CLAS Standards to specific program contexts',0],
    ['atom-o01','O.01','cl-3','O01','Conduct','equity review','Program managers','evaluative','Equity assessment','program','Apply DHS Equity Analysis Toolkit (FARM) to evaluate DSD programs for equity gaps',0],
    ['atom-l01','L.01','cl-4','L01','Design','equity training','DSD workforce','instructional','Training curriculum','learning','Develop culturally responsive equity training materials aligned to IDI stages',0],
    ['atom-w01','W.01','cl-5','W01','Facilitate','community listening sessions','Priority communities','facilitation','Community input report','community','Design and facilitate structured listening sessions with DSD priority populations',0],
    ['atom-a01','A.01','cl-8','A01','Review','agent outputs','Equity consultant','governance','Approval decision','governance','Review and approve or reject outputs generated by autonomous COS agents',1],
    ['atom-x01','X.01','cl-9','X01','Advise','DSD leadership','Deputy Commissioner','strategic','Strategic recommendation','executive','Provide equity-informed strategic counsel on DSD priorities and initiatives',0],
  ];
  atoms.forEach(a => db.run(`INSERT OR IGNORE INTO cos_atoms (id,atom_id,cluster_id,function_id,verb,object,stakeholder,mode,output,taxonomy,source_statement,agent_enabled) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, a));

  // Audit Log
  const auditEvents = [
    ['al-1','system_init','Database initialized with One DSD COS v5.1 seed data',null,'system'],
    ['al-2','auth_login','User gbanks authenticated',null,'user-consultant-1'],
    ['al-3','consultation_created','New consultation: PCA Provider Rate Changes',null,'user-staff-1'],
    ['al-4','equity_review_created','Equity review started: HCBS Waiver Process',null,'user-consultant-1'],
  ];
  auditEvents.forEach(([id,event_type,details,agent_id,user_id]) => db.run(
    `INSERT OR IGNORE INTO audit_log (id,event_type,details,agent_id,user_id,created_at) VALUES (?,?,?,?,?,datetime('now'))`,
    [id,event_type,details,agent_id,user_id]
  ));

  saveDb();
  console.log('✅ Database seeded successfully');
}

module.exports = { getDb, saveDb };
