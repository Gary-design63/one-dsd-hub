// Minnesota Department of Human Services - Disability Services Division (DSD)
// Comprehensive resource index for equity and inclusion operations

export const DSD_WAIVERS = {
  CADI: {
    name: "Community Access for Disability Inclusion (CADI)",
    description: "Provides services and supports for people with physical disabilities and related conditions to live in the community instead of a nursing facility.",
    targetPopulation: "People with physical disabilities, age 0+",
    keyServices: ["Personal Care Assistance", "Adult Day Services", "Environmental Modifications", "Assistive Technology", "Residential Supports", "Transportation"],
    federalAuthority: "1915(c) HCBS Waiver",
    minnesotaStatute: "256B.49",
    annualCost: "Varies by person-centered plan",
    waitlistStatus: "Active waitlist in most counties"
  },
  DD: {
    name: "Developmental Disabilities (DD) Waiver",
    description: "Provides home and community-based services for people with developmental disabilities as an alternative to ICF/DD institutional care.",
    targetPopulation: "People with developmental disabilities, age 0+",
    keyServices: ["Residential Supports (Family Support, Supported Living, Corporate Foster Care)", "Day Training & Habilitation", "Supported Employment", "Behavior Support", "Crisis Services"],
    federalAuthority: "1915(c) HCBS Waiver",
    minnesotaStatute: "256B.501",
    annualCost: "Varies by person-centered plan",
    waitlistStatus: "Active waitlist - priority system in place"
  },
  BI: {
    name: "Brain Injury (BI) Waiver",
    description: "Provides home and community-based services for people with acquired brain injuries as an alternative to nursing facility placement.",
    targetPopulation: "People with acquired brain injuries, age 16+",
    keyServices: ["Adult Day Services", "Structured Day Programs", "Residential Supports", "Personal Support", "Transitional Living Services"],
    federalAuthority: "1915(c) HCBS Waiver",
    minnesotaStatute: "256B.49",
    annualCost: "Varies by person-centered plan",
    waitlistStatus: "Active waitlist"
  },
  EW: {
    name: "Elderly Waiver (EW)",
    description: "Provides home and community-based services for elderly people who would otherwise need nursing facility level of care.",
    targetPopulation: "People age 65+, nursing facility level of care",
    keyServices: ["Adult Day Services", "Case Management", "Homemaker Services", "Personal Care", "Respite Care", "Home Delivered Meals"],
    federalAuthority: "1915(c) HCBS Waiver",
    minnesotaStatute: "256B.0915",
    annualCost: "Varies by person-centered plan",
    waitlistStatus: "No formal waitlist - entitlement program"
  },
  AC: {
    name: "Alternative Care (AC) Program",
    description: "State-funded program providing home and community-based services for people age 65+ who do not yet meet Medicaid eligibility but need support.",
    targetPopulation: "People age 65+, not yet Medicaid eligible",
    keyServices: ["Adult Day Services", "Homemaker", "Chore Services", "Respite", "Transportation", "Assistive Technology"],
    federalAuthority: "State-funded (not federal waiver)",
    minnesotaStatute: "256B.0913",
    annualCost: "State budget allocation",
    waitlistStatus: "Varies by county funding"
  },
  MSC: {
    name: "Medical Assistance for Employed Persons with Disabilities (MA-EPD)",
    description: "Allows people with disabilities to work and maintain Medical Assistance coverage, removing the work disincentive.",
    targetPopulation: "Working adults with disabilities",
    keyServices: ["Full Medical Assistance coverage", "Premium assistance", "Employment supports"],
    federalAuthority: "Ticket to Work and Work Incentives Improvement Act",
    minnesotaStatute: "256B.057",
    annualCost: "Income-based premium",
    waitlistStatus: "No waitlist"
  }
} as const;

export const DSD_DASHBOARDS = {
  EQUITY_DASHBOARD: {
    name: "DSD Equity Dashboard",
    description: "Tracks equity metrics across disability services including disparities by race, ethnicity, geography, and disability type.",
    keyMetrics: [
      "Waiver access rates by race/ethnicity",
      "Wait times by geographic region",
      "Employment outcomes by disability type",
      "Provider network diversity",
      "Complaints and grievances by protected class",
      "Language access utilization rates"
    ],
    updateFrequency: "Quarterly",
    dataSource: "MMIS, Waiver enrollment systems, provider data"
  },
  OLMSTEAD_DASHBOARD: {
    name: "Minnesota Olmstead Plan Dashboard",
    description: "Tracks progress on Minnesota's Olmstead Plan commitments for moving people from institutional to community settings.",
    keyMetrics: [
      "Number of people in community vs. institutional settings",
      "Transitions from nursing facilities",
      "Transitions from ICF/DD",
      "Housing outcomes",
      "Employment outcomes",
      "Waiver slot utilization"
    ],
    updateFrequency: "Annual with quarterly sub-reports",
    dataSource: "Olmstead Subcabinet, DHS data systems"
  },
  PROVIDER_DASHBOARD: {
    name: "HCBS Provider Network Dashboard",
    description: "Monitors home and community-based services provider network adequacy and quality.",
    keyMetrics: [
      "Provider count by service type",
      "Geographic distribution",
      "Provider compliance rates",
      "Maltreatment substantiation rates",
      "Licensing status",
      "Cultural and linguistic competency indicators"
    ],
    updateFrequency: "Monthly",
    dataSource: "Provider licensing system, background study data"
  }
} as const;

export const CBSM = {
  name: "Community-Based Services Manual (CBSM)",
  description: "The primary policy manual for Minnesota's home and community-based services programs administered by DHS.",
  url: "https://www.dhs.state.mn.us/main/idcplg?IdcService=GET_DYNAMIC_CONVERSION&RevisionSelectionMethod=LatestReleased&dDocName=id_000066",
  chapters: {
    CHAPTER_1: "General Information and Program Overview",
    CHAPTER_2: "Eligibility Determinations",
    CHAPTER_3: "Person-Centered Planning",
    CHAPTER_4: "Service Descriptions and Limitations",
    CHAPTER_5: "Provider Requirements and Qualifications",
    CHAPTER_6: "Rate Setting and Billing",
    CHAPTER_7: "Quality Assurance and Monitoring",
    CHAPTER_8: "Grievances and Appeals",
    CHAPTER_9: "HCBS Settings Rule Compliance",
    CHAPTER_10: "Conflict-Free Case Management"
  },
  lastUpdated: "2024",
  administeringAgency: "Minnesota Department of Human Services"
} as const;

export const DWRS_2026 = {
  name: "Disability Waiver Rate System (DWRS) - 2026 Rate Framework",
  description: "Minnesota's system for setting rates for disability waiver services, transitioning to community-based outcome methodology.",
  effectiveDate: "January 1, 2026",
  rateComponents: {
    DIRECT_CARE: {
      name: "Direct Care Component",
      description: "Covers wages, benefits, and supervision for direct support professionals",
      calculationMethod: "Employee hourly rate × hours of service × benefit load factor",
      benefitLoadFactor: 1.26,
      minimumWage: 17.00,
      targetWage: 20.00
    },
    EMPLOYEE_RELATED: {
      name: "Employee-Related Costs",
      description: "Training, background studies, workers comp, unemployment insurance",
      calculationMethod: "Percentage of direct care costs",
      percentage: 0.085
    },
    PROGRAM_AND_ADMIN: {
      name: "Program and Administrative Overhead",
      description: "Indirect costs, administrative functions, program coordination",
      calculationMethod: "Percentage of total service costs",
      percentage: 0.12
    },
    TRANSPORTATION: {
      name: "Transportation",
      description: "Costs for transporting people served to program sites",
      calculationMethod: "Mileage-based or actual cost",
      mileageRate: 0.67
    }
  },
  serviceCategories: {
    RESIDENTIAL: {
      name: "Residential Services",
      types: ["Family Support", "Supported Living Services", "Corporate Foster Care", "Group Residential Housing"],
      rateMethod: "Per diem or per hour depending on service type",
      acuityLevels: ["Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5"]
    },
    DAY_SERVICES: {
      name: "Day Services",
      types: ["Day Training and Habilitation", "Adult Day Services", "Structured Day Programs"],
      rateMethod: "Per hour",
      staffingRatios: ["1:1", "1:2", "1:3", "1:4", "1:6"]
    },
    EMPLOYMENT: {
      name: "Employment Services",
      types: ["Supported Employment Individual", "Supported Employment Group", "Employment Exploration", "Employment Development"],
      rateMethod: "Per hour",
      outcomeIncentives: true
    }
  },
  equityConsiderations: [
    "Rates must support culturally responsive care",
    "Rural and frontier area differentials apply",
    "Language access costs are reimbursable",
    "Provider diversity tracked in rate-setting analysis"
  ]
} as const;

export const CHOICE_DOMAINS = {
  description: "The CHOICE framework guides person-centered planning and self-determination for people with disabilities in Minnesota waiver programs.",
  domains: {
    COMMUNITY: {
      name: "Community",
      description: "Full participation in community life, including integrated settings",
      indicators: [
        "Frequency of community outings",
        "Participation in typical community activities",
        "Access to integrated employment",
        "Use of community resources",
        "Social connections with people without disabilities"
      ],
      olmsteadAlignment: "Core to community integration mandate"
    },
    HOME: {
      name: "Home",
      description: "Living in a setting that feels like home, with privacy and autonomy",
      indicators: [
        "Choice of roommates or living alone",
        "Control over daily schedule",
        "Privacy in bedroom and bathroom",
        "Ability to lock personal spaces",
        "Choice of home décor"
      ],
      hcbsSettingsRule: "Required for HCBS Settings Rule compliance"
    },
    OCCUPATION: {
      name: "Occupation",
      description: "Meaningful activities and employment consistent with individual goals",
      indicators: [
        "Employment in integrated setting",
        "Wage at or above minimum wage",
        "Access to career development",
        "Volunteer and community engagement opportunities",
        "Day service integration with community"
      ],
      employmentFirstAlignment: "Core to Employment First policy"
    },
    INDEPENDENCE: {
      name: "Independence",
      description: "Skills, tools, and supports that promote maximum independence",
      indicators: [
        "Self-direction of services",
        "Use of assistive technology",
        "Development of daily living skills",
        "Financial management capabilities",
        "Decision-making supports"
      ]
    },
    CONNECTIONS: {
      name: "Connections",
      description: "Relationships, social networks, and community belonging",
      indicators: [
        "Frequency of contact with family and friends",
        "Participation in community organizations",
        "Religious/spiritual community involvement",
        "Peer support connections",
        "Natural support network development"
      ]
    },
    EQUITY: {
      name: "Equity",
      description: "Fair access and culturally responsive support regardless of background",
      indicators: [
        "Services delivered in preferred language",
        "Cultural practices respected and supported",
        "Access to culturally specific providers",
        "Elimination of disparities in service access",
        "Anti-discrimination protections enforced"
      ]
    }
  }
} as const;

export const OLMSTEAD_PLAN = {
  name: "Minnesota's Olmstead Plan: A Roadmap to Community Integration",
  legalBasis: "Olmstead v. L.C. (1999) - Supreme Court ruling under ADA Title II",
  minnesotaVersion: "Adopted 2013, updated regularly",
  mandate: "People with disabilities have the right to receive services in the most integrated setting appropriate to their needs.",
  keyCommitments: [
    "Reduce the number of people in nursing facilities who want to live in the community",
    "Reduce the number of people in ICF/DD facilities who want to live in the community",
    "Increase competitive integrated employment for people with disabilities",
    "Ensure people on waiver waitlists receive timely access to services",
    "Expand housing options for people with disabilities",
    "Eliminate disparities in access to community services"
  ],
  subcabinetAgencies: [
    "Department of Human Services",
    "Department of Health",
    "Department of Employment and Economic Development",
    "Department of Corrections",
    "Department of Education",
    "Minnesota Housing Finance Agency",
    "MnDOT"
  ],
  monitoringBody: "Olmstead Subcabinet co-chaired by DHS and MDE",
  reportingCycle: "Annual to legislature"
} as const;

export const EMPLOYMENT_FIRST = {
  name: "Employment First Policy - Minnesota",
  description: "Employment in integrated settings at or above minimum wage is the first and preferred outcome for working-age Minnesotans with disabilities.",
  minnesotaStatute: "268A.15",
  keyPrinciples: [
    "Competitive integrated employment is the expected outcome",
    "Employment services should be offered first before non-employment day services",
    "Presumption of employability for all people with disabilities",
    "Natural supports in the workplace",
    "Career development over placement",
    "Coordination across systems (VRS, county, waiver, education)"
  ],
  partnerAgencies: [
    "Minnesota Department of Employment and Economic Development (DEED) - Vocational Rehabilitation Services (VRS)",
    "Minnesota Department of Education - Transition Services",
    "County Social Services",
    "HCBS Waiver Service Providers",
    "Minnesota Governor's Workforce Development Board"
  ],
  targetOutcomes: {
    wage: "At or above minimum wage (currently $10.85/hr in MN)",
    hours: "Part-time or full-time based on individual goals",
    integration: "Working alongside people without disabilities",
    benefits: "Access to employer-provided benefits when possible"
  },
  equityFocus: [
    "Address racial disparities in employment outcomes",
    "Culturally responsive employment supports",
    "Language access in employment planning",
    "Disability-related employment barriers vs. systemic barriers"
  ]
} as const;

export const DISABILITY_HUB_MN = {
  name: "Disability Hub MN",
  description: "A statewide resource network connecting Minnesotans with disabilities to information, tools, and services.",
  url: "https://disabilityhubmn.org",
  phone: "1-866-333-2466",
  services: [
    "Disability benefits counseling",
    "MN Benefits information",
    "Work incentives planning",
    "Connection to local disability resources",
    "Benefits to Work transition support",
    "Self-directed services information"
  ],
  targetPopulation: "Any Minnesotan with a disability and their families",
  languages: ["English", "Spanish", "Somali", "Hmong", "Vietnamese", "Oromo", "Arabic"],
  funding: "Minnesota Department of Human Services",
  regionalOffices: [
    "Twin Cities Metro",
    "Greater MN - Southeast",
    "Greater MN - Northeast",
    "Greater MN - Northwest",
    "Greater MN - Southwest",
    "Greater MN - Central"
  ],
  equityServices: [
    "Culturally specific outreach",
    "Community health worker partnerships",
    "Trusted messenger networks in BIPOC communities",
    "Accessible information in multiple formats"
  ]
} as const;

export const HCBS_SETTINGS_RULE = {
  name: "HCBS Settings Rule (CMS Final Rule 2014)",
  description: "Federal rule requiring that home and community-based settings have the qualities of integrated community living.",
  effectiveDate: "March 17, 2014",
  fullComplianceDeadline: "March 17, 2023 (extended)",
  requirements: {
    ALL_SETTINGS: [
      "Setting is integrated in and supports access to the greater community",
      "People have full access to community benefits",
      "Rights of privacy, dignity, respect, and freedom from coercion",
      "Autonomy in daily decisions",
      "Community integration opportunities equal to people without disabilities"
    ],
    PROVIDER_OWNED_SETTINGS: [
      "Right to privacy including lockable bedroom/bathroom doors",
      "Choice of roommates",
      "Choice of living arrangements",
      "Control over personal resources and items",
      "Right to have visitors at any time",
      "Right to come and go as one pleases"
    ],
    SETTINGS_PRESUMED_INSTITUTIONAL: [
      "On grounds of or adjacent to institutions",
      "Housing only disability population",
      "Isolates from broader community",
      "Provider controlled",
      "Coercive congregate activities"
    ]
  },
  minnesotaImplementation: "DHS HCBS Transition Plan, ongoing monitoring and site reviews"
} as const;

export const DSD_EQUITY_FRAMEWORK = {
  name: "One DSD Equity and Inclusion Framework",
  vision: "A disability services system where race, ethnicity, language, geography, and other factors do not predict outcomes.",
  missionStatement: "To identify, address, and eliminate disparities in access, quality, and outcomes for people with disabilities across all Minnesota communities.",
  strategicPriorities: [
    {
      priority: "Data and Transparency",
      description: "Collect, analyze, and publicly report disaggregated data on disparities in disability services",
      keyActions: ["Enhance MMIS data collection on race/ethnicity", "Publish quarterly equity dashboards", "Community-level data sharing"]
    },
    {
      priority: "Access and Outreach",
      description: "Eliminate barriers to waiver and disability service access in underserved communities",
      keyActions: ["BIPOC community outreach", "Language access expansion", "Geographic equity in provider networks"]
    },
    {
      priority: "Workforce Development",
      description: "Build a disability services workforce that reflects and serves Minnesota's diverse communities",
      keyActions: ["DSP wage equity", "Culturally responsive workforce training", "BIPOC provider development"]
    },
    {
      priority: "Systems Accountability",
      description: "Hold the disability services system accountable for equitable outcomes",
      keyActions: ["Equity metrics in provider contracts", "Disparity reduction goals", "Community advisory structures"]
    },
    {
      priority: "Community Voice",
      description: "Center the voices of people with disabilities from marginalized communities in policy and planning",
      keyActions: ["Community advisory panels", "Paid community consultant roles", "Co-design processes"]
    }
  ],
  populationFocus: [
    "Black/African American communities",
    "Indigenous/Native American communities",
    "Latinx/Hispanic communities",
    "Asian/Pacific Islander communities",
    "East African immigrant and refugee communities",
    "Rural and Greater Minnesota communities",
    "LGBTQ+ people with disabilities",
    "People with disabilities experiencing poverty"
  ]
} as const;

// Consolidated export for easy access
export const DSD_RESOURCES = {
  waivers: DSD_WAIVERS,
  dashboards: DSD_DASHBOARDS,
  cbsm: CBSM,
  dwrs2026: DWRS_2026,
  choiceDomains: CHOICE_DOMAINS,
  olmstead: OLMSTEAD_PLAN,
  employmentFirst: EMPLOYMENT_FIRST,
  disabilityHub: DISABILITY_HUB_MN,
  hcbsSettingsRule: HCBS_SETTINGS_RULE,
  equityFramework: DSD_EQUITY_FRAMEWORK
} as const;
