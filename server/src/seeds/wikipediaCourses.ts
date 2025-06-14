import { CourseLevel, CourseCategory, WikipediaProject, CourseStatus } from '../models/Course';

export const wikipediaCoursesData = [
  // Beginner Level Courses
  {
    title: "Wikipedia Editing Fundamentals",
    description: "Learn the basics of editing Wikipedia articles, including creating an account, understanding the interface, and making your first edits safely.",
    level: CourseLevel.BEGINNER,
    category: CourseCategory.EDITING_BASICS,
    wikipediaProject: WikipediaProject.WIKIPEDIA,
    tags: ["beginner", "editing", "fundamentals", "getting-started"],
    duration: 180, // 3 hours
    estimatedCompletionTime: 4,
    difficultyRating: 2,
    learningObjectives: [
      "Create and set up a Wikipedia account",
      "Navigate the Wikipedia interface confidently",
      "Make basic edits to existing articles",
      "Use the sandbox for practice",
      "Understand edit summaries and their importance"
    ],
    skillsAcquired: [
      "Basic Wikipedia navigation",
      "Simple text editing",
      "Sandbox usage",
      "Edit summary writing"
    ],
    practiceArticles: [
      "Wikipedia:Sandbox",
      "User:Example/Sandbox"
    ],
    hasAssessment: true,
    passingScore: 80,
    status: CourseStatus.PUBLISHED,
    isPublished: true
  },
  
  {
    title: "Wikitext Markup Mastery",
    description: "Master the wikitext markup language used in Wikipedia. Learn formatting, links, templates, and advanced markup techniques.",
    level: CourseLevel.BEGINNER,
    category: CourseCategory.WIKITEXT_MARKUP,
    wikipediaProject: WikipediaProject.WIKIPEDIA,
    tags: ["wikitext", "markup", "formatting", "links", "templates"],
    duration: 240, // 4 hours
    estimatedCompletionTime: 5,
    difficultyRating: 3,
    learningObjectives: [
      "Format text using wikitext markup",
      "Create internal and external links",
      "Use basic templates and infoboxes",
      "Structure articles with headings and sections",
      "Add images and media to articles"
    ],
    skillsAcquired: [
      "Wikitext formatting",
      "Link creation",
      "Template usage",
      "Article structuring",
      "Media embedding"
    ],
    practiceArticles: [
      "Help:Wikitext",
      "Wikipedia:Tutorial"
    ],
    hasAssessment: true,
    passingScore: 75,
    status: CourseStatus.PUBLISHED,
    isPublished: true
  },

  {
    title: "Reliable Sources and Citations",
    description: "Learn how to identify reliable sources, properly cite them, and build a strong foundation for verifiable Wikipedia content.",
    level: CourseLevel.BEGINNER,
    category: CourseCategory.CITATION_SOURCING,
    wikipediaProject: WikipediaProject.WIKIPEDIA,
    tags: ["sources", "citations", "reliability", "verification", "references"],
    duration: 300, // 5 hours
    estimatedCompletionTime: 6,
    difficultyRating: 4,
    learningObjectives: [
      "Identify reliable vs unreliable sources",
      "Use citation templates effectively",
      "Understand different types of sources",
      "Add proper references to articles",
      "Evaluate source quality and bias"
    ],
    skillsAcquired: [
      "Source evaluation",
      "Citation formatting",
      "Reference management",
      "Fact verification"
    ],
    practiceArticles: [
      "Wikipedia:Reliable sources",
      "Wikipedia:Citing sources"
    ],
    hasAssessment: true,
    passingScore: 85,
    status: CourseStatus.PUBLISHED,
    isPublished: true
  },

  // Intermediate Level Courses
  {
    title: "Wikipedia Content Policies Deep Dive",
    description: "Understand Wikipedia's core content policies: Neutral Point of View, Verifiability, and No Original Research.",
    level: CourseLevel.INTERMEDIATE,
    category: CourseCategory.CONTENT_POLICIES,
    wikipediaProject: WikipediaProject.WIKIPEDIA,
    tags: ["policies", "NPOV", "verifiability", "original-research", "guidelines"],
    duration: 360, // 6 hours
    estimatedCompletionTime: 8,
    difficultyRating: 6,
    prerequisites: [], // Will be populated with course IDs after creation
    learningObjectives: [
      "Apply neutral point of view in writing",
      "Ensure all content is verifiable",
      "Avoid original research violations",
      "Handle controversial topics appropriately",
      "Resolve content disputes using policies"
    ],
    skillsAcquired: [
      "NPOV writing",
      "Policy application",
      "Content evaluation",
      "Dispute resolution"
    ],
    practiceArticles: [
      "Wikipedia:Neutral point of view",
      "Wikipedia:Verifiability",
      "Wikipedia:No original research"
    ],
    hasAssessment: true,
    passingScore: 80,
    status: CourseStatus.PUBLISHED,
    isPublished: true
  },

  {
    title: "Article Creation Workshop",
    description: "Learn the complete process of creating new Wikipedia articles from research to publication, including notability guidelines.",
    level: CourseLevel.INTERMEDIATE,
    category: CourseCategory.ARTICLE_CREATION,
    wikipediaProject: WikipediaProject.WIKIPEDIA,
    tags: ["article-creation", "notability", "research", "drafts", "AfC"],
    duration: 480, // 8 hours
    estimatedCompletionTime: 10,
    difficultyRating: 7,
    learningObjectives: [
      "Research topics for new articles",
      "Assess notability requirements",
      "Create comprehensive article drafts",
      "Navigate the Articles for Creation process",
      "Respond to reviewer feedback effectively"
    ],
    skillsAcquired: [
      "Research methodology",
      "Notability assessment",
      "Draft creation",
      "Peer review response"
    ],
    practiceArticles: [
      "Wikipedia:Your first article",
      "Wikipedia:Articles for creation"
    ],
    hasAssessment: true,
    passingScore: 75,
    status: CourseStatus.PUBLISHED,
    isPublished: true
  },

  {
    title: "Community Collaboration and Conflict Resolution",
    description: "Master the art of collaborative editing, handling disagreements, and building consensus in the Wikipedia community.",
    level: CourseLevel.INTERMEDIATE,
    category: CourseCategory.CONFLICT_RESOLUTION,
    wikipediaProject: WikipediaProject.WIKIPEDIA,
    tags: ["collaboration", "consensus", "conflict-resolution", "community", "discussion"],
    duration: 300, // 5 hours
    estimatedCompletionTime: 7,
    difficultyRating: 6,
    learningObjectives: [
      "Engage constructively in talk page discussions",
      "Build consensus through collaboration",
      "Handle edit conflicts professionally",
      "Use dispute resolution processes",
      "Maintain civility in disagreements"
    ],
    skillsAcquired: [
      "Discussion facilitation",
      "Consensus building",
      "Conflict mediation",
      "Community engagement"
    ],
    practiceArticles: [
      "Wikipedia:Consensus",
      "Wikipedia:Dispute resolution"
    ],
    hasAssessment: true,
    passingScore: 80,
    status: CourseStatus.PUBLISHED,
    isPublished: true
  },

  // Advanced Level Courses
  {
    title: "Advanced Wikipedia Editing Techniques",
    description: "Master advanced editing skills including complex templates, parser functions, and administrative tools.",
    level: CourseLevel.ADVANCED,
    category: CourseCategory.ADVANCED_EDITING,
    wikipediaProject: WikipediaProject.WIKIPEDIA,
    tags: ["advanced", "templates", "parser-functions", "lua", "modules"],
    duration: 600, // 10 hours
    estimatedCompletionTime: 15,
    difficultyRating: 9,
    learningObjectives: [
      "Create and modify complex templates",
      "Use parser functions effectively",
      "Understand Lua scripting basics",
      "Implement advanced formatting techniques",
      "Optimize article performance and accessibility"
    ],
    skillsAcquired: [
      "Template development",
      "Parser function usage",
      "Lua scripting",
      "Performance optimization"
    ],
    practiceArticles: [
      "Wikipedia:Advanced template coding",
      "Wikipedia:Lua"
    ],
    hasAssessment: true,
    passingScore: 70,
    status: CourseStatus.PUBLISHED,
    isPublished: true
  },

  // Sister Projects Courses
  {
    title: "Wikimedia Commons: Media and Licensing",
    description: "Learn to contribute media files to Wikimedia Commons, understand licensing, and organize multimedia content.",
    level: CourseLevel.INTERMEDIATE,
    category: CourseCategory.COMMONS_MEDIA,
    wikipediaProject: WikipediaProject.COMMONS,
    tags: ["commons", "media", "licensing", "copyright", "images"],
    duration: 360, // 6 hours
    estimatedCompletionTime: 8,
    difficultyRating: 5,
    learningObjectives: [
      "Upload media files to Wikimedia Commons",
      "Understand copyright and licensing requirements",
      "Categorize and organize media files",
      "Create galleries and media collections",
      "Handle copyright issues and DMCA requests"
    ],
    skillsAcquired: [
      "Media uploading",
      "Copyright assessment",
      "File organization",
      "License selection"
    ],
    practiceArticles: [
      "Commons:First steps",
      "Commons:Copyright rules"
    ],
    hasAssessment: true,
    passingScore: 80,
    status: CourseStatus.PUBLISHED,
    isPublished: true
  },

  {
    title: "Wikidata Editing and Structured Data",
    description: "Master Wikidata editing, understand structured data concepts, and learn to create and maintain data items.",
    level: CourseLevel.ADVANCED,
    category: CourseCategory.WIKIDATA_EDITING,
    wikipediaProject: WikipediaProject.WIKIDATA,
    tags: ["wikidata", "structured-data", "properties", "items", "SPARQL"],
    duration: 480, // 8 hours
    estimatedCompletionTime: 12,
    difficultyRating: 8,
    learningObjectives: [
      "Create and edit Wikidata items",
      "Understand properties and qualifiers",
      "Use Wikidata tools and interfaces",
      "Write basic SPARQL queries",
      "Connect Wikidata to Wikipedia articles"
    ],
    skillsAcquired: [
      "Structured data editing",
      "Property management",
      "SPARQL querying",
      "Data modeling"
    ],
    practiceArticles: [
      "Wikidata:Introduction",
      "Wikidata:SPARQL tutorial"
    ],
    hasAssessment: true,
    passingScore: 75,
    status: CourseStatus.PUBLISHED,
    isPublished: true
  }
];
