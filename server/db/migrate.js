require('dotenv').config();
const { pool, query } = require('./index');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function migrate() {
  console.log('Running database migration...');

  // ─── Schema ───────────────────────────────────────────────────────────────

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      department TEXT,
      idi_stage TEXT DEFAULT 'Denial',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS equity_reviews (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      level TEXT DEFAULT 'scan',
      status TEXT DEFAULT 'in_progress',
      current_step INTEGER DEFAULT 1,
      step_data TEXT DEFAULT '{}',
      user_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS action_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      owner TEXT,
      status TEXT DEFAULT 'not_started',
      priority TEXT DEFAULT 'normal',
      progress INTEGER DEFAULT 0,
      due_date TEXT,
      goal_id TEXT,
      review_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      department TEXT,
      status TEXT DEFAULT 'open',
      priority TEXT DEFAULT 'normal',
      requester_id TEXT,
      assigned_to TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS operational_goals (
      id TEXT PRIMARY KEY,
      number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      weight INTEGER DEFAULT 15,
      base_progress INTEGER DEFAULT 0,
      target_date TEXT,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      description TEXT,
      content TEXT,
      is_featured INTEGER DEFAULT 0,
      authority_level TEXT DEFAULT 'internal',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS community_profiles (
      id TEXT PRIMARY KEY,
      community_name TEXT NOT NULL,
      category TEXT,
      languages_json TEXT DEFAULT '[]',
      cultural_context TEXT,
      communication_guidance TEXT,
      trust_factors TEXT,
      service_considerations TEXT,
      contacts TEXT,
      strengths_json TEXT DEFAULT '[]',
      priority_flag INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS training_courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      format TEXT DEFAULT 'self-paced',
      level TEXT DEFAULT 'foundational',
      idi_stage TEXT,
      duration_minutes INTEGER DEFAULT 60,
      is_required INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS training_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      completed_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS deia_topics (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      definition TEXT,
      dsd_relevance TEXT,
      frameworks TEXT,
      discussion_questions TEXT,
      tags_json TEXT DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reflections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      reflection_text TEXT NOT NULL,
      prompt_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS spaced_retrieval_prompts (
      id TEXT PRIMARY KEY,
      week_number INTEGER,
      prompt_text TEXT NOT NULL,
      idi_stage TEXT DEFAULT 'Minimization',
      active INTEGER DEFAULT 1,
      week_start TEXT
    );

    CREATE TABLE IF NOT EXISTS weekly_syntheses (
      id TEXT PRIMARY KEY,
      week_start TEXT NOT NULL,
      synthesis_text TEXT NOT NULL,
      week_number INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS agent_definitions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      autonomy TEXT DEFAULT 'supervised',
      approval_gate TEXT DEFAULT 'mandatory',
      config_json TEXT DEFAULT '{}',
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS learning_loop_proposals (
      id TEXT PRIMARY KEY,
      trigger_pattern TEXT NOT NULL,
      suggested_change TEXT,
      lint_score INTEGER DEFAULT 85,
      status TEXT DEFAULT 'pending',
      proposed_by TEXT,
      decided_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS approval_queue (
      id TEXT PRIMARY KEY,
      item_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      status TEXT DEFAULT 'pending',
      created_by TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      decided_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS consultant_documents (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      file_type TEXT,
      classification TEXT DEFAULT 'reference',
      routing_destination TEXT DEFAULT 'knowledge_base',
      storage_path TEXT,
      authority_level TEXT DEFAULT 'internal',
      version TEXT,
      upload_date TEXT,
      approved INTEGER DEFAULT 0,
      usage_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      details TEXT,
      agent_id TEXT,
      user_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS working_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      initiative TEXT,
      status TEXT DEFAULT 'active',
      findings_summary TEXT,
      members_json TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS odet_records (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      record_type TEXT,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS equity_team (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      charter_role TEXT,
      unit TEXT,
      email TEXT,
      joined_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS community_feedback (
      id TEXT PRIMARY KEY,
      feedback_text TEXT NOT NULL,
      attribution TEXT,
      community_tag TEXT,
      collection_cycle TEXT,
      sentiment TEXT DEFAULT 'neutral',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      event_date TEXT,
      event_type TEXT DEFAULT 'equity',
      description TEXT,
      location TEXT,
      is_recurring INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS team_activities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      duration_minutes INTEGER DEFAULT 30,
      equity_theme TEXT,
      materials TEXT DEFAULT 'None',
      instructions TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cos_clusters (
      id TEXT PRIMARY KEY,
      cluster_id TEXT UNIQUE NOT NULL,
      cluster_type TEXT DEFAULT 'primary',
      color TEXT DEFAULT '#4A9EDB',
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS cos_atoms (
      id TEXT PRIMARY KEY,
      atom_id TEXT UNIQUE NOT NULL,
      cluster_id TEXT,
      function_id TEXT,
      verb TEXT NOT NULL,
      object TEXT NOT NULL,
      stakeholder TEXT,
      mode TEXT,
      output TEXT,
      taxonomy TEXT,
      source_statement TEXT,
      agent_enabled INTEGER DEFAULT 0,
      requires_approval INTEGER DEFAULT 1,
      last_executed TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cos_outputs (
      id TEXT PRIMARY KEY,
      atom_id TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'approved',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cos_approvals (
      id TEXT PRIMARY KEY,
      atom_id TEXT,
      atom_name TEXT,
      output_text TEXT,
      output_type TEXT DEFAULT 'text',
      status TEXT DEFAULT 'pending',
      revision_notes TEXT,
      requires_approval INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      decided_at TIMESTAMPTZ
    );
  `);

  console.log('✓ Schema ready');
}

async function seed() {
  // Only seed if no users exist
  const { rows } = await pool.query('SELECT COUNT(*) as n FROM users');
  if (parseInt(rows[0].n) > 0) {
    console.log('✓ Seed data already present, skipping');
    return;
  }

  console.log('Seeding database...');

  const pwHash = bcrypt.hashSync('password123', 10);
  const consultantHash = bcrypt.hashSync('equity2026!', 10);

  // Users
  await pool.query(`
    INSERT INTO users VALUES
      ('user-consultant-1','gbanks',$1,'Gary Banks','equity_lead','Equity and Inclusion Operations','Acceptance',NOW()),
      ('user-staff-1','staff1',$2,'Alex Johnson','staff','Disability Services','Minimization',NOW()),
      ('user-staff-2','staff2',$2,'Maria Rivera','staff','Community Engagement','Acceptance',NOW())
    ON CONFLICT (id) DO NOTHING
  `, [consultantHash, pwHash]);

  // Operational Goals
  await pool.query(`
    INSERT INTO operational_goals VALUES
      ('goal-1',1,'Disparity Reduction in Service Access','Reduce measurable disparities in HCBS waiver access for priority communities',20,38,'2026-12-31','active'),
      ('goal-2',2,'Community Voice Integration','Integrate authentic community voice into all major program decisions',18,52,'2026-12-31','active'),
      ('goal-3',3,'Workforce Diversity and Belonging','Improve workforce demographic representation and inclusive culture',16,44,'2026-12-31','active'),
      ('goal-4',4,'DEIA Learning and Competency','Build cultural competency and equity analysis capacity across DSD',15,61,'2026-12-31','active'),
      ('goal-5',5,'Equitable Contracting and Procurement','Advance equity in DSD vendor and contractor relationships',16,29,'2026-12-31','active'),
      ('goal-6',6,'Strategic Communication and Accountability','Establish transparent equity reporting and accountability systems',15,47,'2026-12-31','active')
    ON CONFLICT (id) DO NOTHING
  `);

  // Equity Reviews
  await pool.query(`
    INSERT INTO equity_reviews VALUES
      ('review-1','HCBS Waiver Application Process','full','in_progress',2,'{}','user-staff-1',NOW()-INTERVAL '3 days',NOW()),
      ('review-2','MnCHOICES Assessment Equity Review','scan','in_progress',4,'{}','user-staff-2',NOW()-INTERVAL '7 days',NOW()),
      ('review-3','Crisis Response Protocol Analysis','full','completed',6,'{}','user-staff-1',NOW()-INTERVAL '14 days',NOW())
    ON CONFLICT (id) DO NOTHING
  `);

  // Action Items
  await pool.query(`
    INSERT INTO action_items (id,title,description,owner,status,priority,progress,due_date,goal_id,review_id,created_at) VALUES
      ('ai-1','Conduct community listening sessions with Somali advisory group',null,'Gary Banks','in_progress','high',40,'2026-04-30',null,null,NOW()),
      ('ai-2','Update HCBS waiver materials in Hmong and Spanish',null,'Maria Rivera','in_progress','high',60,'2026-04-15',null,null,NOW()),
      ('ai-3','Develop CLAS Standards self-assessment checklist for DSD programs',null,'Gary Banks','not_started','normal',0,'2026-05-31',null,null,NOW()),
      ('ai-4','Analyze MnCHOICES data by race/ethnicity for Q1 2026',null,'Alex Johnson','in_progress','normal',25,'2026-04-20',null,null,NOW()),
      ('ai-5','Facilitate IDI debrief session with supervisory staff',null,'Gary Banks','not_started','normal',0,'2026-05-15',null,null,NOW()),
      ('ai-6','Review vendor contracts for equity provisions',null,'Gary Banks','in_progress','normal',15,'2026-06-30',null,null,NOW())
    ON CONFLICT (id) DO NOTHING
  `);

  // Consultations
  await pool.query(`
    INSERT INTO consultations VALUES
      ('consult-1','Equity Review for PCA Provider Rate Changes','Need support analyzing equity impacts of proposed PCA provider rate adjustments on communities of color','Medicaid Policy','open','urgent','user-staff-1','user-consultant-1',NOW(),NOW()),
      ('consult-2','Cultural Responsiveness Review: Deaf and Hard of Hearing Services','Request review of current service delivery model for DHH community','Accessibility Services','open','high','user-staff-1','user-consultant-1',NOW(),NOW()),
      ('consult-3','Indigenous Community Advisory Group Formation','Support needed to establish formal advisory group with Dakota and Ojibwe communities','Community Engagement','in_progress','high','user-staff-1','user-consultant-1',NOW(),NOW())
    ON CONFLICT (id) DO NOTHING
  `);

  // Resources
  const resources = [
    ['res-1','DHS Equity Analysis Toolkit','equity_toolkit','Six-step framework for analyzing equity in decisions, policies, and programs.','The DHS Equity Analysis Toolkit provides a structured process for examining equity impacts. Step 1: Identify the Decision. Step 2: Identify Affected Populations. Step 3: Analyze Data. Step 4: Assess Equity Impacts. Step 5: Develop Action Plan. Step 6: Monitor and Evaluate.',1],
    ['res-2','CLAS Standards Reference Guide','clas','National Standards for Culturally and Linguistically Appropriate Services (1-15)','The 15 CLAS Standards cover: Principal Standard (1), Governance Leadership and Workforce (2-4), Communication and Language Assistance (5-8), and Engagement, Continuous Improvement and Accountability (9-15).',1],
    ['res-3','Disability Justice Principles','disability_justice','Ten principles of disability justice from Sins Invalid','The ten principles are: Intersectionality, Leadership of the Most Impacted, Anti-Capitalist Politics, Cross-Movement Solidarity, Recognizing Wholeness, Sustainability, Commitment to Cross-Disability Solidarity, Interdependence, Collective Access, and Collective Liberation.',1],
    ['res-4','ADA Title II Compliance Guide','ada','Federal requirements for state and local government disability services','Title II of the ADA prohibits discrimination against qualified individuals with disabilities in all programs, activities, and services of public entities. The Olmstead decision requires states to provide community-based services when appropriate.',1],
    ['res-5','IDI Assessment Framework','training','Intercultural Development Inventory stages and progression','The IDI measures orientation toward cultural difference along the Intercultural Development Continuum: Denial, Polarization, Minimization, Acceptance, and Adaptation.',0],
    ['res-6','GARE Racial Equity Framework','equity_toolkit','Government Alliance on Race and Equity framework','GARE framework: Normalize (regular conversations about race), Organize (institutional commitment), Operationalize (implement tools and processes). Key tools include Racial Equity Impact Assessment and the Racial Equity Action Plan.',0],
    ['res-7','Universal Design for Learning Guide','ada','UDL principles for accessible program design','UDL principles: Multiple Means of Engagement (why), Multiple Means of Representation (what), Multiple Means of Action and Expression (how). Applications for DSD program materials and service delivery.',0],
    ['res-8','Cultural Humility vs Cultural Competence','community','Understanding the distinction and application in DSD work','Cultural humility is a lifelong process of self-reflection and learning. Unlike cultural competence, which implies mastery, it acknowledges the limits of knowledge and centers community expertise.',0],
  ];
  for (const r of resources) {
    await pool.query(
      `INSERT INTO resources (id,title,category,description,content,is_featured,authority_level,created_at) VALUES ($1,$2,$3,$4,$5,$6,'internal',NOW()) ON CONFLICT (id) DO NOTHING`,
      r
    );
  }

  // Community Profiles
  const profiles = [
    ['cp-1','Somali Community','East African','["Somali","English","Arabic"]',
      'Somali community members in Minnesota represent the largest Somali diaspora outside Africa. Community is predominantly Muslim with strong clan and family networks. Elder authority is significant.',
      'Build relationships through community gatekeepers before direct outreach. Written materials should be at 6th-grade reading level or lower. Audio and visual formats often more effective than text. Allow ample time.',
      'Partnering with mosques and Islamic centers. Engagement through Somali community organizations like CAPI and Brian Coyle Center. Family and community leaders vouching for services.',
      'Ensure halal dietary options at meetings. Prayer accommodations important. Female staff for intake with women when possible. Xenophobia and immigration fears create barriers.',
      'Contact CAPI USA, Confederation of Somali Community in Minnesota, Dar Al-Hijrah Mosque',
      '["Strong family support networks","Entrepreneurial spirit","Community resilience","Youth civic engagement","Cultural richness"]',1],
    ['cp-2','Hmong Community','Southeast Asian','["Hmong","English","Lao"]',
      'Hmong community in Minnesota is one of the largest globally. Strong clan (xeem) structure with 18 clans. Traditional healthcare practices coexist with Western medicine.',
      'Clan leaders and community elders are key trust intermediaries. Storytelling and visual communication more effective than written text. Extended family involvement in decision-making is expected.',
      'Working with the Coalition of Asian American Leaders. Partnership with Hmong National Development and Hmong Cultural Center.',
      'Traditional healing practices (Txiv Neeb) may complement medical treatment. Clan leaders may need to approve major decisions.',
      'Contact CAAL, Hmong Cultural Center, Hmong National Development Inc.',
      '["Clan-based mutual support","Agricultural and entrepreneurial traditions","Youth bilingual advocacy","Cultural ceremony richness"]',1],
    ['cp-3','Indigenous / American Indian Community','Native American','["Ojibwe/Anishinaabe","Dakota/Lakota","English"]',
      'Minnesota has 11 federally recognized tribal nations plus significant urban Indian population. Tribal sovereignty is a critical context. Historical trauma from boarding schools and forced removal.',
      'Approach with humility and patience. Acknowledge historical trauma explicitly. Tribal consultation processes are legally mandated for tribes.',
      'Formal tribal consultation per Executive Order 21-02. Partnership with American Indian Family Center, Division of Indian Work.',
      'Respect tribal sovereignty in all interactions. Traditional healing is a protected right. Two-spirit identities should be affirmed.',
      'Contact American Indian OEO, Division of Indian Work, each tribal nation social services office',
      '["Tribal sovereignty and self-determination","Traditional ecological knowledge","Youth culture bearers","Resilience through centuries of adversity"]',1],
    ['cp-4','Latino/a/x Community','Latin American','["Spanish","English","Indigenous languages (Mayan, Mixtec)"]',
      'Minnesota Latinos represent diverse nationalities including Mexican, Guatemalan, Honduran, Puerto Rican, and others. Undocumented status is a significant barrier.',
      'Promotoras/promotores model very effective. Spanish language materials essential. Trust is built through personal relationship (personalismo) before institutional engagement.',
      'Partnership with CLUES, HACER, Centro Legal de la Raza, Catholic Charities.',
      'Fear of immigration enforcement creates significant barrier. Indigenous-language speakers from Guatemala/Mexico may not speak Spanish.',
      'Contact CLUES, Centro, HACER, Comunidades Latinas Unidas En Servicio',
      '["Familismo and community solidarity","Cultural resilience","Youth bilingual leadership","Vibrant cultural expression"]',1],
    ['cp-5','Deaf and Hard of Hearing Community','Disability','["American Sign Language","English"]',
      'Deaf community is a distinct linguistic and cultural minority. Deaf culture celebrates deafness as difference, not deficit. ASL is a full and complete language.',
      'ASL interpreters required for all substantial communication. Do not speak to interpreter; address the Deaf person directly.',
      'Minnesota Association of Deaf Citizens. Hearing Loss Association of America MN chapter.',
      'Captioning required for all videos. Video relay service for phone calls. Visual fire alarms.',
      'Contact NAD, MN Association of Deaf Citizens, DeafBlind Services MN',
      '["Rich ASL literature and art","Deaf cultural identity","Community advocacy strength","Bilingual ASL-English capacity"]',0],
    ['cp-6','East African Community (Broader)','East African','["Somali","Amharic","Oromo","Tigrinya","English"]',
      'Beyond Somali community, MN has significant Ethiopian (Amharic, Oromo, Tigrinya speakers), Eritrean, and other East African communities. Each has distinct languages and cultures.',
      'Do not conflate Somali and Ethiopian communities. Language diversity requires multiple translators.',
      'Oromo Community in Minnesota. Ethiopian Community in Minnesota.',
      'Ethiopian Orthodox Christianity, Islam, and evangelical Christianity all represented. Coffee ceremony is important cultural ritual.',
      'Contact ACCES, Ethiopian Community of Minnesota, Oromo Community of MN',
      '["Educational aspiration","Strong community networks","Cultural ceremony richness","Entrepreneurship"]',0],
  ];
  for (const p of profiles) {
    await pool.query(
      `INSERT INTO community_profiles (id,community_name,category,languages_json,cultural_context,communication_guidance,trust_factors,service_considerations,contacts,strengths_json,priority_flag,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()) ON CONFLICT (id) DO NOTHING`,
      p
    );
  }

  // Training Courses
  await pool.query(`
    INSERT INTO training_courses VALUES
      ('course-1','Understanding Racism in America','An introduction to structural racism, implicit bias, and their manifestations in health and human services.','async eLearning','foundational','Denial',90,0),
      ('course-2','CLAS Standards in Practice','How to apply all 15 National CLAS Standards in DSD program delivery.','async eLearning','intermediate','Minimization',120,0),
      ('course-3','Disability Justice Foundations','Introduction to disability justice principles and their application in HCBS and waiver services.','async eLearning','foundational','Minimization',60,0),
      ('course-4','DHS Equity Analysis Toolkit Deep Dive','Comprehensive walkthrough of all six steps with case studies from DSD programs.','facilitated workshop','intermediate','Acceptance',180,0),
      ('course-5','Cultural Intelligence in Practice','Applying CQ Drive, Knowledge, Strategy, and Action in community engagement.','async eLearning','intermediate','Acceptance',90,0),
      ('course-6','Trauma-Informed Equity Work','Understanding historical and ongoing trauma and its intersection with equity in disability services.','async eLearning','advanced','Adaptation',120,0)
    ON CONFLICT (id) DO NOTHING
  `);

  // Training Progress
  await pool.query(`
    INSERT INTO training_progress VALUES
      ('tp-1','user-staff-1','course-1',100,NOW(),NOW()),
      ('tp-2','user-staff-1','course-2',60,null,NOW()),
      ('tp-3','user-staff-2','course-1',100,NOW(),NOW())
    ON CONFLICT (id) DO NOTHING
  `);

  // DEIA Topics
  const topics = [
    ['topic-1','Structural Racism',
      'Cumulative and compounding effects of an array of factors that systematically privilege white people and disadvantage people of color.',
      'Structural racism explains why disparities in HCBS access, crisis response, and employment supports persist despite good intentions. Data disaggregated by race is the first step.',
      'GARE Framework, Racial Equity Impact Assessment, Ibram X. Kendi',
      'What structural factors might explain disparities in your program data? How might current policies perpetuate historical inequities?',
      '["race","equity","systems","policy"]'],
    ['topic-2','Cultural Humility',
      'A lifelong process of self-reflection and critique, learning from others about their experiences, and acknowledging the limitations of knowledge.',
      'Cultural humility is more appropriate than cultural competence for DSD work because it centers community expertise.',
      'Tervalon & Murray-Garcia (1998), Hofstede Cultural Dimensions, Livermore CQ Framework',
      'How do you stay curious about communities you work with? What practices help you maintain humility?',
      '["culture","humility","learning","self-reflection"]'],
    ['topic-3','Intersectionality',
      'A framework for understanding how aspects of a person social and political identities combine to create different modes of discrimination and privilege.',
      'DSD serves people with disabilities who may also be BIPOC, LGBTQ+, elderly, low-income, or immigrants. Intersecting identities create compounding barriers.',
      'Kimberle Crenshaw, Disability Justice framework, Sins Invalid',
      'In what ways do multiple identities interact for the people your program serves?',
      '["identity","race","disability","gender","intersectionality"]'],
    ['topic-4','Implicit Bias',
      'Attitudes or stereotypes that affect our understanding, actions, and decisions in an unconscious manner.',
      'Implicit biases affect MnCHOICES assessors, county case managers, and provider staff in ways that create disparate outcomes even without conscious intent.',
      'Project Implicit, GARE tools, Kirwan Institute',
      'What biases might influence your professional decisions? How do organizational processes either expose or shield implicit bias?',
      '["bias","unconscious","decision-making","equity"]'],
    ['topic-5','Disability Justice',
      'A social justice movement led by disabled people of color that centers the experiences of the most marginalized disabled people.',
      'Disability justice expands disability rights by centering intersectionality, cross-movement solidarity, and leadership of most impacted.',
      'Sins Invalid 10 Principles, Lydia X. Z. Brown, Mia Mingus',
      'How do the 10 disability justice principles challenge or affirm your current program approach?',
      '["disability","justice","intersectionality","leadership"]'],
  ];
  for (const t of topics) {
    await pool.query(
      `INSERT INTO deia_topics (id,title,definition,dsd_relevance,frameworks,discussion_questions,tags_json,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) ON CONFLICT (id) DO NOTHING`,
      t
    );
  }

  // Spaced Retrieval Prompts
  await pool.query(`
    INSERT INTO spaced_retrieval_prompts VALUES
      ('srp-1',13,'Reflect on a recent professional decision. What equity considerations were present? What would the DHS Equity Analysis Toolkit add to your analysis?','Acceptance',1,CURRENT_DATE::TEXT),
      ('srp-2',14,'Think about a community DSD serves. What do you know about their history with government services? What would it take to build or deepen trust?','Minimization',0,(CURRENT_DATE + INTERVAL ''7 days'')::TEXT)
    ON CONFLICT (id) DO NOTHING
  `);

  // Weekly Synthesis
  await pool.query(`
    INSERT INTO weekly_syntheses VALUES (
      'ws-1','2026-03-23',
      'This week the division continued progress on six operational equity goals with overall composite progress at 45%. Three new consultations were opened: PCA provider rate equity review (urgent), DHH service delivery review, and Indigenous advisory group formation. The learning loop agent proposed 2 new response patterns — both pending consultant approval. Community feedback collection from the Somali advisory group yielded 8 new entries.',
      13,NOW()
    ) ON CONFLICT (id) DO NOTHING
  `);

  // Agent Definitions
  const agents = [
    ['agent-1','Consultation Agent','supervised','mandatory','{"role":"Triage and route staff consultation requests to the appropriate consultant response tier based on urgency, topic, and program area","capabilities":["triage","routing","response-drafting","follow-up-scheduling"]}'],
    ['agent-2','Equity Assist Agent','supervised','optional','{"role":"Provide real-time guidance on equity analysis, CLAS standards, community profiles, and DHS toolkit application","capabilities":["query-response","framework-lookup","citation","contextual-guidance"]}'],
    ['agent-3','Learning Loop Agent','supervised','mandatory','{"role":"Analyze interaction patterns and propose improvements to agent prompts and response patterns based on usage data","capabilities":["pattern-analysis","prompt-improvement","lint-scoring","proposal-generation"]}'],
    ['agent-4','Operations Agent','supervised','mandatory','{"role":"Generate weekly synthesis reports, track goal progress, and surface actionable insights from platform data","capabilities":["synthesis-generation","kpi-tracking","trend-analysis","report-drafting"]}'],
    ['agent-5','Document Agent','supervised','mandatory','{"role":"Ingest, classify, and route uploaded documents to appropriate knowledge systems and approval queues","capabilities":["classification","routing","metadata-extraction","knowledge-indexing"]}'],
    ['agent-6','Goal Decomposition Agent','supervised','mandatory','{"role":"Break strategic equity goals into structured task trees with owners, timelines, and success metrics","capabilities":["task-decomposition","owner-assignment","timeline-planning","success-criteria"]}'],
  ];
  for (const a of agents) {
    await pool.query(
      `INSERT INTO agent_definitions (id,name,autonomy,approval_gate,config_json,is_active,created_at) VALUES ($1,$2,$3,$4,$5,1,NOW()) ON CONFLICT (id) DO NOTHING`,
      a
    );
  }

  // Learning Loop Proposals
  await pool.query(`
    INSERT INTO learning_loop_proposals VALUES
      ('llp-1','community profile + service barrier','Add barrier-specific response template for when users ask about community service barriers. Current responses are too generic.',88,'pending','agent-3',null,NOW()),
      ('llp-2','CLAS standards 5-8 language access','Strengthen language access guidance with current DHS interpretation services policy reference.',91,'pending','agent-3',null,NOW())
    ON CONFLICT (id) DO NOTHING
  `);

  // Approval Queue
  await pool.query(`
    INSERT INTO approval_queue VALUES
      ('aq-1','document','doc-1','HCBS Equity Assessment Q1 2026','Uploaded document pending classification and approval for knowledge base integration.','pending','user-staff-1',NOW(),null),
      ('aq-2','agent_output','llp-1','Learning Loop Proposal: community profile + service barrier','Agent proposes new response template for community service barrier queries.','pending','agent-3',NOW(),null)
    ON CONFLICT (id) DO NOTHING
  `);

  // Working Groups
  await pool.query(`
    INSERT INTO working_groups VALUES
      ('wg-1','Disparity Data Subcommittee','ODET Working Group: Analyze and respond to DSD program disparity data','active','Completed baseline disparity analysis for HCBS waiver. Identified 18% gap in Somali and Hmong completion rates.','[]'),
      ('wg-2','CLAS Standards Implementation Team','ODET Working Group: Advance CLAS standard implementation across DSD programs','active','Completed CLAS 1-4 gap assessment. Developed language access protocol.','[]'),
      ('wg-3','Indigenous Advisory Workgroup','ODET Working Group: Meaningful engagement with Dakota and Ojibwe communities','forming','Initial outreach to tribal social service directors completed.','[]'),
      ('wg-4','Workforce Equity Subcommittee','ODET Working Group: Improve DSD workforce diversity and belonging','active','Analyzed 2025 workforce demographics. Identified gaps at supervisory level.','[]')
    ON CONFLICT (id) DO NOTHING
  `);

  // ODET Records
  await pool.query(`
    INSERT INTO odet_records (id,title,record_type,status,notes,created_at) VALUES
      ('odet-1','ODET Kickoff Meeting Q1 2026','meeting','completed',null,NOW()),
      ('odet-2','Disparity Data Presentation to DSD Leadership','presentation','completed',null,NOW()),
      ('odet-3','Community Listening Session - Somali Advisory','engagement','completed',null,NOW()),
      ('odet-4','CLAS Standards Training - Session 1','training','completed',null,NOW()),
      ('odet-5','Q1 2026 Equity Program Report','report','in_progress',null,NOW()),
      ('odet-6','IDI Group Assessment - Supervisory Staff','assessment','scheduled',null,NOW())
    ON CONFLICT (id) DO NOTHING
  `);

  // Equity Team
  await pool.query(`
    INSERT INTO equity_team (id,full_name,charter_role,unit,email,joined_at) VALUES
      ('et-1','Gary Banks','Equity and Inclusion Operations Consultant (Lead)','DEIA Operations',null,NOW()),
      ('et-2','Teresa vanderBent','One DSD Team Member','Program Delivery',null,NOW()),
      ('et-3','Leigh Ann Ahmad','One DSD Team Member / Manager','Program Management',null,NOW()),
      ('et-4','Carrie Jakober','One DSD Team Member','Community Engagement',null,NOW()),
      ('et-5','Leah Zoladkiewicz','One DSD Team Member','Policy and Compliance',null,NOW()),
      ('et-6','Anna Lindqvist','One DSD Team Member','Training and Development',null,NOW()),
      ('et-7','Marcus Thompson','One DSD Team Member','Data and Analytics',null,NOW()),
      ('et-8','Sadia Hassan','One DSD Team Member','Community Relations',null,NOW()),
      ('et-9','David Chen','One DSD Team Member','Accessibility Services',null,NOW()),
      ('et-10','Rosa Hernandez','One DSD Team Member','Workforce Development',null,NOW())
    ON CONFLICT (id) DO NOTHING
  `);

  // Community Feedback
  await pool.query(`
    INSERT INTO community_feedback (id,feedback_text,attribution,community_tag,collection_cycle,sentiment,created_at) VALUES
      ('cf-1','The intake process assumes I can read English. My mother only speaks Somali. We need interpretation from the start, not just when we ask.','Somali community member, Minneapolis','Somali Community','Q1 2026','constructive',NOW()),
      ('cf-2','We appreciate when case managers take time to understand our traditional healing practices alongside medical treatment. That respect means everything.','Hmong elder, St. Paul','Hmong Community','Q1 2026','positive',NOW()),
      ('cf-3','Tribal sovereignty must be respected in all interactions. We are not just another population to serve; we are sovereign nations with our own systems.','Tribal social services director','Indigenous Community','Q1 2026','instructive',NOW()),
      ('cf-4','When you change the forms and do not tell us, we lose trust. Consistency and advance notice of changes matter for our community.','Latino community advocate','Latino/a/x Community','Q1 2026','constructive',NOW()),
      ('cf-5','The video relay service option is helpful, but not all of our community uses it. Please always offer ASL interpreters for in-person meetings.','Deaf community advocate, Minneapolis','Deaf Community','Q1 2026','constructive',NOW())
    ON CONFLICT (id) DO NOTHING
  `);

  // Calendar Events
  await pool.query(`
    INSERT INTO calendar_events VALUES
      ('ev-1','ODET Monthly Meeting','2026-04-08','odet','Monthly One DSD Equity Team meeting','Virtual - Teams',0),
      ('ev-2','Hmong Cultural New Year Awareness Week','2026-04-15','cultural','Awareness week for scheduling sensitivity','Statewide',0),
      ('ev-3','IDI Staff Assessment Launch','2026-04-20','equity','Intercultural Development Inventory assessment begins for supervisory staff','DSD Offices',0),
      ('ev-4','Community Listening Session - Latino Advisory','2026-04-22','odet','Formal listening session with Latino community advisory group','CLUES - St. Paul',0),
      ('ev-5','CLAS Standards Workshop Session 2','2026-04-29','equity','CLAS Standards 5-8 implementation workshop','Virtual - Teams',0),
      ('ev-6','Q1 2026 Disparity Data Review','2026-05-05','equity','DSD leadership review of Q1 equity metrics and disparity data','DHS Building',0),
      ('ev-7','Asian American Pacific Islander Heritage Month','2026-05-01','cultural','Month-long cultural awareness - includes Hmong, Somali, and SE Asian communities','Statewide',0),
      ('ev-8','Tribal Consultation - Mille Lacs','2026-05-12','equity','Formal government-to-government tribal consultation','Mille Lacs Band',0)
    ON CONFLICT (id) DO NOTHING
  `);

  // Team Activities
  const activities = [
    ['ta-1','Four Corners Perspective Share','icebreaker',15,'Perspective-Taking','Printed corner signs, pens',null],
    ['ta-2','Privilege Walk','equity_exercise',30,'Power and Privilege','Open space, statement cards',null],
    ['ta-3','Fishbowl Discussion: Community Trust','discussion',45,'Community Engagement','Circle of chairs, topic cards',null],
    ['ta-4','Identity Wheel Reflection','reflection',20,'Intersectionality','Identity wheel worksheet',null],
    ['ta-5','Equity Impact Scenario Analysis','case_study',60,'Equity Analysis','Case study cards, toolkit',null],
    ['ta-6','Story Swap: Community Asset Mapping','storytelling',40,'Community Strengths','Large paper, markers',null],
    ['ta-7','Microaggressions Awareness Gallery Walk','awareness',25,'Implicit Bias','Printed gallery cards',null],
    ['ta-8','Community Profile Speed Share','knowledge',30,'Cultural Intelligence','Profile cards or digital display',null],
    ['ta-9','Policy Analysis through Equity Lens','analysis',50,'Equity Analysis','Policy document, toolkit worksheet',null],
    ['ta-10','Active Bystander Role Play','skills',45,'Allyship','Scenario cards',null],
    ['ta-11','CQ Drive Check-In','reflection',10,'Cultural Intelligence','CQ scale worksheet',null],
    ['ta-12','Ground Rules Co-Creation','facilitation',15,'Belonging','Flip chart, markers',null],
  ];
  for (const a of activities) {
    await pool.query(
      `INSERT INTO team_activities (id,title,category,duration_minutes,equity_theme,materials,instructions,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) ON CONFLICT (id) DO NOTHING`,
      a
    );
  }

  // COS Clusters
  await pool.query(`
    INSERT INTO cos_clusters VALUES
      ('cl-1','Disparity Analysis & Monitoring','primary','#E05252','Monitor, analyze and report on service access and outcome disparities across DSD priority populations'),
      ('cl-2','Community Engagement & Trust','primary','#4A9EDB','Build and sustain authentic relationships with priority communities through structured engagement'),
      ('cl-3','Equity Program Operations','primary','#78BE21','Operate the daily functions of the One DSD Equity Program across 150-180 DSD staff'),
      ('cl-4','CLAS & Compliance','primary','#FFB71B','Advance implementation of CLAS Standards and legal compliance requirements'),
      ('cl-5','Workforce Equity','secondary','#C084FC','Improve DSD workforce diversity, inclusion, and equity in hiring and retention'),
      ('cl-6','Learning & Capacity Building','secondary','#FB923C','Build equity competency through training, spaced retrieval, and learning loops'),
      ('cl-7','Strategic Communications','secondary','#4A9EDB','Communicate equity program progress, priorities, and impact internally and externally'),
      ('cl-8','Agentic OS Management','primary','#E05252','Manage, approve, audit and improve the AI agent infrastructure of the Consultant OS'),
      ('cl-9','Executive Advising','primary','#78BE21','Provide equity-informed strategic counsel to DSD leadership and the broader ADSA division')
    ON CONFLICT (id) DO NOTHING
  `);

  // COS Atoms (54 atoms across 9 clusters)
  const atoms = [
    ['D.01','cl-1','D','Analyze','HCBS waiver application completion data by race and ethnicity','DSD Data Team','Quantitative','Disparity Report','Statistical Analysis','Analyze HCBS waiver application completion disparities by race, ethnicity, and disability type to identify systemic gaps'],
    ['D.02','cl-1','D','Produce','monthly equity metrics dashboard for DSD leadership','DSD Leadership','Reporting','Dashboard Update','Data Visualization','Produce monthly metrics dashboard showing equity indicators across all DSD programs'],
    ['D.03','cl-1','D','Flag','emerging disparity signals in real-time service data','Programs Team','Alert','Disparity Alert','Monitoring','Flag and document emerging disparity signals in DSD program service data for consultant review'],
    ['D.04','cl-1','D','Draft','quarterly disparity analysis summary for ADSA leadership','ADSA Equity Division','Writing','Quarterly Report','Reporting','Draft comprehensive quarterly summary of DSD service access and outcome disparities'],
    ['D.05','cl-1','D','Map','geographic distribution of service gaps across Minnesota counties','County Partners','Spatial Analysis','Equity Map','Geographic Analysis','Map geographic distribution of service access gaps across MN county DSD programs'],
    ['D.06','cl-1','D','Benchmark','DSD disparity metrics against CLAS standards compliance targets','Compliance Team','Comparative','Benchmark Report','Standards Compliance','Benchmark DSD disparity metrics against CLAS standards and national equity benchmarks'],
    ['C.01','cl-2','C','Draft','community listening session agenda and facilitation guide','Community Partners','Facilitation','Session Materials','Community Engagement','Draft structured listening session agenda aligned with engagement protocol Phase 1'],
    ['C.02','cl-2','C','Synthesize','community feedback into programmatic recommendations','Programs Team','Synthesis','Feedback Report','Community Voice','Synthesize community feedback entries into actionable program improvement recommendations'],
    ['C.03','cl-2','C','Produce','community trust-building activity calendar for Q2 2026','ODET Team','Planning','Activity Calendar','Relationship Building','Produce quarterly community engagement activity calendar with trust-building events'],
    ['C.04','cl-2','C','Draft','tribal consultation preparation materials per EO 21-02','Tribal Nations','Government-to-Government','Consultation Brief','Tribal Sovereignty','Draft tribal consultation preparation materials for formal government-to-government engagement'],
    ['C.05','cl-2','C','Update','community profile for target community with new input','Community Advisory','Documentation','Profile Update','Cultural Intelligence','Update community cultural intelligence profile with new advisory group input'],
    ['C.06','cl-2','C','Generate','culturally responsive outreach message in target language','Communications','Translation','Outreach Content','Language Access','Generate culturally responsive outreach message adapted for specific community context'],
    ['O.01','cl-3','O','Triage','incoming staff consultation requests by urgency and type','Consultant','Operations','Triage Report','Consultation Management','Triage and categorize all incoming consultation requests into Tier 1/2/3 response tracks'],
    ['O.02','cl-3','O','Draft','equity review guidance response for staff consultation','Staff Member','Guidance','Consultation Response','Technical Assistance','Draft detailed equity analysis guidance response to staff consultation request'],
    ['O.03','cl-3','O','Generate','weekly synthesis report for Consultant OS dashboard','Consultant','Reporting','Weekly Synthesis','Operations Reporting','Generate Monday morning synthesis of program activity, flags, and priorities'],
    ['O.04','cl-3','O','Update','strategic goal progress metrics based on weekly data','Goals Committee','Tracking','Goal Update','Strategic Management','Update operational goal progress metrics with current week data and trend analysis'],
    ['O.05','cl-3','O','Draft','monthly One DSD program newsletter for DSD staff','All DSD Staff','Communications','Newsletter','Internal Communications','Draft monthly equity program newsletter with updates, resources, and reflection prompts'],
    ['O.06','cl-3','O','Schedule','ODET team meeting agenda and materials','ODET Team','Facilitation','Meeting Agenda','Team Operations','Prepare ODET monthly meeting agenda with discussion items and pre-read materials'],
    ['O.07','cl-3','O','Classify','uploaded document and route to appropriate system','Knowledge Base','Document Management','Document Routing','Document Intelligence','Classify uploaded document by type, authority, and relevance and route accordingly'],
    ['O.08','cl-3','O','Generate','action item accountability report for consultant review','Consultant','Accountability','Action Report','Program Accountability','Generate weekly action item accountability report showing progress, blockers, and owners'],
    ['L.01','cl-4','L','Assess','DSD program against all 15 CLAS Standards','Programs Team','Compliance','CLAS Gap Assessment','Standards Compliance','Conduct structured assessment of DSD program compliance with all 15 National CLAS Standards'],
    ['L.02','cl-4','L','Draft','language access plan for DSD program','Language Access Team','Planning','Language Access Plan','Language Rights','Draft CLAS-aligned language access implementation plan for specified DSD program'],
    ['L.03','cl-4','L','Review','informed consent materials for cultural and linguistic appropriateness','Programs Team','Review','Compliance Review','Informed Consent','Review DSD informed consent materials for CLAS compliance and cultural appropriateness'],
    ['L.04','cl-4','L','Generate','ADA/Olmstead compliance checklist for program review','Compliance Officer','Compliance','Compliance Checklist','Disability Rights','Generate ADA Title II and Olmstead compliance checklist for DSD program self-assessment'],
    ['L.05','cl-4','L','Draft','CLAS standards implementation recommendation memo','DSD Leadership','Policy','Implementation Memo','Policy Guidance','Draft CLAS implementation recommendation memo with specific program-level actions'],
    ['W.01','cl-5','W','Analyze','DSD workforce demographics against state and county populations','HR Department','Demographic Analysis','Workforce Report','Workforce Equity','Analyze DSD workforce demographic composition against service population demographics'],
    ['W.02','cl-5','W','Draft','inclusive hiring rubric for supervisor position','Hiring Manager','Tool Development','Hiring Rubric','Equity in Hiring','Draft equity-informed interview rubric and evaluation criteria for supervisory hiring'],
    ['W.03','cl-5','W','Produce','quarterly belonging and inclusion pulse survey for DSD staff','All DSD Staff','Survey Design','Pulse Survey','Workplace Belonging','Produce brief quarterly belonging survey to track DSD staff inclusion experience over time'],
    ['W.04','cl-5','W','Synthesize','exit interview data for equity and inclusion themes','HR Department','Analysis','Exit Interview Analysis','Workforce Retention','Synthesize exit interview and departure data for equity-related themes and patterns'],
    ['W.05','cl-5','W','Draft','equity-focused onboarding module for new DSD hires','New Staff','Curriculum','Onboarding Module','Workforce Development','Draft equity and inclusion onboarding module for new DSD staff orientation'],
    ['E.01','cl-6','E','Generate','weekly spaced retrieval prompt for DSD staff reflection','All DSD Staff','Learning','Weekly Prompt','Spaced Learning','Generate weekly equity reflection prompt calibrated to staff IDI stage distribution'],
    ['E.02','cl-6','E','Analyze','training completion data and identify participation gaps','Training Coordinator','Analysis','Training Gap Report','Learning Analytics','Analyze training completion rates by unit, role, and demographic to identify gaps'],
    ['E.03','cl-6','E','Draft','DEIA learning path recommendation for staff member','Staff Member','Personalized Learning','Learning Path','Individual Development','Draft personalized DEIA learning path recommendation based on IDI stage and role'],
    ['E.04','cl-6','E','Produce','culturally responsive team activity for unit meeting','Unit Manager','Facilitation','Team Activity','Team Learning','Produce structured equity learning activity for unit or team meeting context'],
    ['E.05','cl-6','E','Update','learning loop based on approved pattern improvement','Equity Assist Agent','System Improvement','Loop Update','Agent Learning','Update Equity Assist agent response pattern based on approved learning loop proposal'],
    ['E.06','cl-6','E','Generate','eLearning module outline on equity topic','eLearning Developer','Curriculum','Module Outline','Curriculum Development','Generate structured outline for eLearning module on specified equity or inclusion topic'],
    ['S.01','cl-7','S','Draft','quarterly equity progress report for DSD Director and Deputy','DSD Leadership','Executive Reporting','Executive Report','Upward Reporting','Draft quarterly equity program progress report for DSD Director and Deputy Director'],
    ['S.02','cl-7','S','Produce','ADSA equity division briefing for division leadership','ADSA Equity Division','Division Reporting','Division Brief','Cross-Division Alignment','Produce ADSA Equity Division briefing on DSD equity program milestones and needs'],
    ['S.03','cl-7','S','Draft','staff communication about equity program update','All DSD Staff','Internal Communications','Staff Update','Program Communications','Draft all-staff communication about equity program update, new resources, or process change'],
    ['S.04','cl-7','S','Generate','equity impact summary for external stakeholder report','External Partners','External Reporting','Impact Summary','External Communications','Generate equity impact summary suitable for external partner or legislative reporting'],
    ['S.05','cl-7','S','Draft','talking points for equity topic for DSD supervisors','DSD Supervisors','Leadership Support','Talking Points','Leadership Preparation','Draft concise talking points to help DSD supervisors communicate on equity topics'],
    ['A.01','cl-8','A','Review','pending agent output in approval queue','Consultant','Oversight','Approval Decision','Agent Governance','Review all pending agent outputs in approval queue and make approve/reject decisions'],
    ['A.02','cl-8','A','Audit','agent execution log for accuracy and appropriateness','Consultant','Audit','Audit Report','Agent Accountability','Audit recent agent execution log for accuracy, appropriateness, and policy compliance'],
    ['A.03','cl-8','A','Evaluate','learning loop proposal against program standards','Consultant','Evaluation','Proposal Decision','Agent Improvement','Evaluate learning loop proposal against program standards, lint score, and strategic fit'],
    ['A.04','cl-8','A','Generate','agentic OS performance report for consultant review','Consultant','Reporting','Performance Report','OS Monitoring','Generate weekly OS performance report: executions, approvals, outputs, loop updates'],
    ['A.05','cl-8','A','Configure','agent approval requirements for agent function','Consultant','Configuration','Config Update','Agent Configuration','Review and update approval gate requirements for specified agent function or cluster'],
    ['A.06','cl-8','A','Draft','agent function documentation for new COS addition','Consultant','Documentation','Function Spec','OS Documentation','Draft specification documentation for proposed new COS function atom'],
    ['X.01','cl-9','X','Brief','DSD Director on emerging equity risk or opportunity','DSD Director','Strategic Advisory','Executive Brief','Executive Counsel','Draft confidential executive brief on emerging equity risk, opportunity, or decision point'],
    ['X.02','cl-9','X','Prepare','equity lens analysis for policy change under consideration','Policy Team','Policy Advising','Equity Analysis','Policy Counsel','Prepare equity lens analysis of proposed DSD policy change with recommendations'],
    ['X.03','cl-9','X','Draft','annual equity program strategic plan update','DSD Leadership','Strategic Planning','Plan Update','Strategic Planning','Draft annual One DSD Equity Program strategic plan update with goals, metrics, and activities'],
    ['X.04','cl-9','X','Generate','cross-divisional equity alignment briefing for ADSA','ADSA Leadership','Cross-Division','Alignment Brief','Strategic Alignment','Generate cross-divisional equity alignment briefing to identify synergies and gaps across ADSA'],
    ['X.05','cl-9','X','Produce','legislative context brief on disability and equity policy','DSD Leadership','Legislative','Policy Brief','Legislative Relations','Produce brief summarizing relevant legislative context for DSD equity and disability policy'],
    ['X.06','cl-9','X','Draft','conflict resolution guidance for equity-related workplace issue','HR / Manager','Advisory','Conflict Brief','HR Counsel','Draft equity-informed conflict resolution guidance for workplace situation with equity dimensions'],
    ['X.07','cl-9','X','Synthesize','national best practices for equity in HCBS programs','Programs Team','Research','Best Practices Brief','Research and Development','Synthesize current national best practices for equity in HCBS and disability services programs'],
  ];

  for (const a of atoms) {
    await pool.query(
      `INSERT INTO cos_atoms (id,atom_id,cluster_id,function_id,verb,object,stakeholder,mode,output,taxonomy,source_statement,agent_enabled,requires_approval,last_executed,created_at)
       VALUES ($1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,0,1,null,NOW()) ON CONFLICT (id) DO NOTHING`,
      [a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9]]
    );
  }

  // Sample COS Output
  await pool.query(`
    INSERT INTO cos_outputs (id,atom_id,title,content,status,created_at,updated_at) VALUES (
      'co-1','O.01',
      'Consultation Triage Report - Week of 2026-03-23',
      'CONSULTATION TRIAGE REPORT
Week of March 23, 2026

TIER 1 - URGENT (Same-day response required):
1. PCA Provider Rate Changes (consult-1) - Medicaid Policy
   Equity impact analysis of proposed rate adjustments. Affects 3,200+ PCAs.

TIER 2 - HIGH (Response within 3 business days):
2. DHH Service Delivery Review (consult-2) - Accessibility Services

TIER 3 - NORMAL (Response within 10 business days):
3. Indigenous Advisory Group Formation (consult-3) - Community Engagement',
      'approved',NOW(),NOW()
    ) ON CONFLICT (id) DO NOTHING
  `);

  // Audit Log Seed
  const auditEvents = [
    ['al-1','system_init','System initialized with seed data',null,'user-consultant-1'],
    ['al-2','auth_login','User gbanks authenticated',null,'user-consultant-1'],
    ['al-3','review_created','Equity review created: HCBS Waiver Application Process','agent-1','user-consultant-1'],
    ['al-4','profile_updated','Community profile updated: Somali Community','agent-2','user-consultant-1'],
    ['al-5','consultation_triaged','Consultation triaged: PCA Provider Rate Changes (URGENT)','agent-1','user-consultant-1'],
    ['al-6','synthesis_generated','Weekly synthesis generated for week 13','agent-4','user-consultant-1'],
    ['al-7','loop_proposed','Learning loop proposal submitted by Learning Loop Agent','agent-3','user-consultant-1'],
    ['al-8','document_classified','Agent document classification: HCBS Equity Assessment Q1 2026','agent-5','user-consultant-1'],
  ];
  for (const [i, e] of auditEvents.entries()) {
    await pool.query(
      `INSERT INTO audit_log (id,event_type,details,agent_id,user_id,created_at) VALUES ($1,$2,$3,$4,$5,NOW()-INTERVAL '${7-i} days') ON CONFLICT (id) DO NOTHING`,
      e
    );
  }

  console.log('✓ Seed data loaded');
}

async function run() {
  try {
    await migrate();
    await seed();
    console.log('✓ Database ready');
  } catch (err) {
    console.error('Migration failed:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

// Run directly: node server/db/migrate.js
if (require.main === module) {
  run().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { migrate, seed };
