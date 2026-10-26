import type { RoleDomain } from './types.ts';

const esc = (s: string) => String(s).replace(/\\/g, '\\textbackslash{}').replace(/([%&#_$])/g, '\\$1');

// 1. Comprehensive Verified Company HQ Map (Default: New York, NY)
export const companyHqMap: Record<string, string> = {
  'Achira': 'San Francisco, CA',
  'Abridge': 'San Francisco, CA',
  'Attio': 'San Francisco, CA',
  'Basis-ai': 'New York, NY',
  'Checkly': 'Boston, MA',
  'Checkout.com': 'New York, NY',
  'Equal1': 'Fremont, CA',
  'Fireworks AI': 'San Mateo, CA',
  'Fullstory': 'Atlanta, GA',
  'Higgsfieldai': 'San Francisco, CA',
  'LanceDB': 'San Francisco, CA',
  'Featherlessai': 'New York, NY',
  'Irregular': 'New York, NY',
  'Buffer': 'San Francisco, CA',
  'Fonoa': 'New York, NY',
  'Hedra': 'San Francisco, CA',
  'Incident': 'New York, NY',
  'Knock': 'New York, NY',
  'Lightfield': 'San Francisco, CA',
  'Localstack': 'San Francisco, CA',
  'Niural': 'New York, NY',
  'Onebrief': 'San Francisco, CA',
  'Orbit': 'San Francisco, CA',
  'Restream': 'Austin, TX',
  'Signoz': 'San Francisco, CA',
  'Tandem Health': 'New York, NY',
  'Hyperbolic': 'New York, NY',
  'Mastra': 'San Francisco, CA',
  'Unstructured': 'San Francisco, CA',
  'Stickermule': 'Amsterdam, NY',
  'Hexa': 'New York, NY',
  'Foundation': 'San Francisco, CA',
  'Great Sky': 'Boulder, CO',
  'Nascent': 'New York, NY',
  'Nectar Social': 'San Francisco, CA',
  'Noda-ai': 'San Francisco, CA',
  'Pascal': 'New York, NY',
  'Swap': 'New York, NY',
  'Tem': 'San Francisco, CA',
  'Tracelabs': 'New York, NY',
  'Varick-agents': 'San Francisco, CA',
  'Viktor': 'San Francisco, CA',
  'Liquid AI': 'Boston, MA',
  'Qdrant': 'San Francisco, CA',
  'Zed Industries': 'Boulder, CO',
  'Diligent': 'New York, NY',
  'Pagerduty': 'San Francisco, CA',
  'Atomic Industries': 'Detroit, MI',
  'Novacredit': 'San Francisco, CA',
  'Forter': 'New York, NY',
  'Geotab': 'Las Vegas, NV',
  'Justanswer': 'San Francisco, CA',
  'Jumio': 'Sunnyvale, CA',
  'Liveperson': 'New York, NY',
  'Coursera': 'Mountain View, CA',
  'Elementbiosciences': 'San Diego, CA',
  'Buildkite': 'San Francisco, CA',
  'Dialpad': 'San Ramon, CA',
  'Sezzle': 'Minneapolis, MN',
  'Yugabyte': 'Sunnyvale, CA',
  'Sword Health': 'Draper, UT',
  'Guidewheel': 'San Francisco, CA',
  'Efficient Computer': 'Pittsburgh, PA',
  'Modernhealth': 'San Francisco, CA',
  'Recordedfuture': 'Somerville, MA',
  'Ridgeline': 'San Ramon, CA',
  'Securityscorecard': 'New York, NY',
  'Wasabi': 'Boston, MA',
  'Teikametrics': 'Boston, MA',
  'Inmobi': 'San Mateo, CA',
  'Sureify': 'San Jose, CA',
  'Litify': 'New York, NY',
  'Recidiviz': 'San Francisco, CA',
  'Halcyon': 'Austin, TX',
  'Rigetti Computing': 'Berkeley, CA',
  'Zanskar': 'Salt Lake City, UT',
  'Velaura': 'San Francisco, CA',
  'Arcadia': 'Washington, DC',
  'CloudFactory': 'Durham, NC',
  'FlowX.AI': 'New York, NY',
  'Fuse Energy': 'New York, NY',
  'Terabase Energy': 'Berkeley, CA',
  'Infleqtion': 'Boulder, CO',
  'Quintessent': 'Santa Barbara, CA',
  'Blackrock Neurotech': 'Salt Lake City, UT',
  'GRIDSIGHT': 'San Francisco, CA',
  'TYLsemi': 'San Jose, CA',
  'Syllable AI': 'Sunnyvale, CA',
  'Scout Discoveries': 'New York, NY',
  'Basis Theory': 'New York, NY',
  'Blue Origin': 'Kent, WA',
  'Coval': 'San Francisco, CA',
  'Upwind Security': 'San Francisco, CA',
  'Straiker': 'Mountain View, CA',
  'micro1': 'San Francisco, CA',
  'Boost Run': 'San Francisco, CA',
  'Type One Energy': 'Knoxville, TN',
  'Maybell Quantum': 'Denver, CO',
  'Classiq': 'Chicago, IL',
  'Quantum Machines': 'New York, NY',
  'Adfin': 'New York, NY',
  'CapitalOS': 'San Francisco, CA',
  'Natural': 'San Francisco, CA',
  'Qolab': 'San Francisco, CA',
  'Sharpa': 'San Francisco, CA',
  'Algen Biotechnologies': 'Berkeley, CA',
  'Converge Bio': 'Boston, MA',
  'Expedition': 'Cambridge, MA',
  'Feathery': 'San Francisco, CA',
  'GATC Health': 'Irvine, CA',
  'Isomorphic Labs': 'Cambridge, MA',
  'Ramon.Space': 'San Jose, CA',
  'Campfire': 'San Francisco, CA',
  'Checkr': 'San Francisco, CA',
  'GiveCampus': 'Washington, DC',
  'Grafana Labs': 'New York, NY',
  'Inngest': 'San Francisco, CA',
  'Iterable': 'San Francisco, CA',
  'Okta': 'San Francisco, CA',
  'Prequel': 'New York, NY',
  'PropelAuth': 'San Francisco, CA',
  'RVO Health': 'Charlotte, NC',
  'Scispot': 'Boston, MA',
  'Sphere': 'San Francisco, CA',
  'Tank Payments': 'Austin, TX',
  'Vooma': 'San Francisco, CA',
  'Aviator': 'San Francisco, CA',
  'Consumer Reports': 'Yonkers, NY',
  'Nash': 'San Francisco, CA',
  'DiligenceSquared': 'New York, NY',
  'Diode Computers': 'New York, NY',
  'Codes Health': 'New York, NY',
  'Confido': 'New York, NY',
  'Arpari': 'New York, NY',
  'Attain Talent': 'New York, NY',
  'DeepInfra': 'Palo Alto, CA',
  'A Security': 'San Francisco, CA',
  'Astelia': 'New York, NY',
  'Astronomer': 'New York, NY',
  'Deepnote': 'San Francisco, CA',
  'E2B': 'San Francisco, CA',
  'Hightouch': 'San Francisco, CA',
  'PlanetScale': 'Mountain View, CA',
  'PulumiCorp': 'Seattle, WA',
  'RunPod': 'Cherry Hill, NJ',
  'Svix': 'San Francisco, CA',
  'Turing': 'Palo Alto, CA',
  'Verkada': 'San Mateo, CA',
  'Vitalize Care': 'San Francisco, CA',
  'Weave': 'San Francisco, CA'
};

// 2. Generic Standard Engineering Role Title Cleaner
export function getGenericRoleTitle(company: string, expectedRole?: string, verifiedTitle?: string): string {
  if (company === 'Abridge') return 'Software Engineer';
  if (company === 'Basis-ai') return 'AI Engineer';
  if (company === 'Fireworks AI') return 'Full Stack Developer';
  if (company === 'Nectar Social') return 'Backend Software Engineer';
  if (company === 'Liquid AI') return 'Machine Learning Engineer';
  if (company === 'Straiker') return 'AI Engineer';
  if (company === 'Swap') return 'Analytics Engineer';
  if (company === 'RunPod') return 'Full Stack Developer';

  const raw = (verifiedTitle || expectedRole || '').toLowerCase();
  
  if (/analytics|data engineer|dbt/i.test(raw)) return 'Analytics Engineer';
  if (/full[\s-]stack/i.test(raw)) return 'Full Stack Developer';
  if (/frontend|front[\s-]end/i.test(raw)) return 'Frontend Developer';
  if (/ai engineer|ai software|agent|llm|rag|generative|ai solutions|ai developer/i.test(raw)) return 'AI Engineer';
  if (/machine learning|mlops|model serving|inference/i.test(raw)) return 'Machine Learning Engineer';
  if (/site reliability|sre\b/i.test(raw)) return 'Site Reliability Engineer';
  if (/devops|platform|infrastructure|cloud/i.test(raw)) return 'Platform Engineer';
  if (/security|appsec|cyber/i.test(raw)) return 'Security Engineer';
  if (/distributed/i.test(raw)) return 'Distributed Systems Engineer';
  if (/backend/i.test(raw)) return 'Backend Software Engineer';
  if (/product engineer/i.test(raw)) return 'Full Stack Developer';
  if (/forward deployed/i.test(raw)) return 'Software Engineer';
  if (/systems/i.test(raw)) return 'Systems Software Engineer';
  if (/software/i.test(raw)) return 'Software Engineer';
  if (/developer/i.test(raw)) return 'Software Developer';
  return 'Software Engineer';
}

// 3. Domain Taxonomy Classifier
export function classifyRoleDomain(company: string, role: string, jdText?: string): RoleDomain {
  const roleLower = role.toLowerCase();
  const compLower = company.toLowerCase();
  const text = (jdText || '').toLowerCase();

  // Special data/analytics overrides
  if (company.toLowerCase() === 'swap' || /analytics|data engineer|dbt\b/i.test(roleLower)) {
    return 'data';
  }

  // 1. Role title priority
  if (/ai engineer|ai software|agent|llm|rag|generative/i.test(roleLower)) return 'ai';
  if (/full[\s-]stack|frontend|front[\s-]end/i.test(roleLower)) return 'fullstack';
  if (/machine learning|mlops|model serving|inference|ml\b/i.test(roleLower)) return 'ml';
  if (/security|appsec|cyber/i.test(roleLower)) return 'security';
  if (/platform|infrastructure|devops|sre/i.test(roleLower)) return 'cloud';
  if (/distributed|backend/i.test(roleLower)) return 'distributed';
  if (/health|clinical|ehr|fhir|hipaa|medical|patient|biotech|genom|bio\b|radiology/i.test(compLower + ' ' + roleLower)) {
    return 'healthcare';
  }

  // 2. JD domain requirements
  if (/\b(?:dbt|analytics engineering|data warehouse|data modeling)\b/i.test(text)) return 'data';
  if (/\b(?:fhir|hl7|hipaa|patient records?|clinical workflows?|dicom)\b/i.test(text)) return 'healthcare';
  if (/\b(?:agentic|multi-agent|model context protocol|\bmcp\b|langgraph|\brag\b|prompt engineering)\b/i.test(text)) return 'ai';
  if (/\b(?:frontend|react\.js|ui architecture|user interfaces?)\b/i.test(text)) return 'fullstack';
  if (/\b(?:kubernetes|terraform|devops|observability|opentelemetry|sre|cloud infrastructure)\b/i.test(text)) return 'cloud';
  if (/\b(?:oauth2|sso|rbac|soc2|infosec|cybersecurity|application security)\b/i.test(text)) return 'security';
  if (/\b(?:triton|model serving|distributed training|pytorch)\b/i.test(text)) return 'ml';

  return 'distributed';
}

// 4. Clean Skills Section Generator (No HTML/CSS, React.js explicitly included, no pgvector)
export function getCleanSkillsSection(domain: RoleDomain, jdText?: string): string {
  const text = (jdText || '').toLowerCase();
  
  let langOrder = 'Python, TypeScript, JavaScript, Go (Golang), SQL, Bash';
  if (domain === 'data' || (/sql/i.test(text) && /dbt/i.test(text))) {
    langOrder = 'SQL, Python, TypeScript, Go (Golang), Bash';
  } else if (/go\b|golang/i.test(text) && !/python/i.test(text)) {
    langOrder = 'Go (Golang), Python, TypeScript, SQL, C++, Bash';
  } else if (/typescript|javascript|react/i.test(text) && !/python/i.test(text)) {
    langOrder = 'TypeScript, JavaScript, Python, Go (Golang), SQL, Bash';
  } else if (/c\+\+/i.test(text) && !/python/i.test(text)) {
    langOrder = 'C++, Python, Go (Golang), TypeScript, SQL, Bash';
  } else if (/go\b|golang/i.test(text) && /python/i.test(text)) {
    langOrder = 'Python, Go (Golang), TypeScript, SQL, C++, Bash';
  }

  let line1Head = 'Backend', line1Vals = 'FastAPI, Go, REST APIs, GraphQL, gRPC, Node.js, Celery, Docker, Microservices';
  let line2Head = 'Languages', line2Vals = langOrder;
  let line3Head = 'Backend & Frontend', line3Vals = 'FastAPI, Go, React.js, REST APIs, GraphQL, Node.js, WebSockets, Microservices';
  let line4Head = 'AI & Search', line4Vals = 'RAG, LangChain, Dense Embeddings, Semantic Search, ChromaDB, Pinecone';
  let line5Head = 'Databases & Cloud', line5Vals = 'PostgreSQL, DynamoDB, Redis, MongoDB, AWS (Lambda, ECS, S3), Azure, Docker, CI/CD';
  let line6Head = 'DevOps & Observability', line6Vals = 'Docker, Kubernetes, Terraform, Prometheus, Grafana, OpenTelemetry, CI/CD';

  if (domain === 'data') {
    line1Head = 'Data & Analytics';
    line1Vals = 'dbt, SQL, Airflow, Dimensional Modeling, Data Warehousing, ETL Pipelines';
    line3Head = 'Backend & Web';
    line3Vals = 'FastAPI, React.js, REST APIs, gRPC, Node.js, Celery, Docker, Microservices';
    line4Head = 'AI & Search';
    line4Vals = 'LangChain, LangGraph, Model Context Protocol (MCP), RAG, ChromaDB, Pinecone';
    line5Head = 'Databases & Cloud';
    line5Vals = 'PostgreSQL, DynamoDB, Redis, MongoDB, AWS (S3, Lambda), Azure, Docker, CI/CD';
    line6Head = 'DevOps & Monitoring';
    line6Vals = 'Docker, Kubernetes, Terraform, Grafana, Prometheus, CI/CD';
  } else if (domain === 'healthcare') {
    line1Head = 'Healthcare Systems';
    line1Vals = 'FHIR, HL7, DICOM, Clinical Decision Support, HIPAA Compliance, Medical Imaging';
    line3Head = 'Backend & Web';
    line3Vals = 'FastAPI, React.js, REST APIs, gRPC, Celery, Docker, Kubernetes, Microservices';
    line4Head = 'AI & Retrieval';
    line4Vals = 'RAG, LangChain, Dense Embeddings, Semantic Search, ChromaDB, Pinecone';
    line5Head = 'Databases & Cloud';
    line5Vals = 'PostgreSQL, DynamoDB, Redis, AWS (ECS, S3), Azure, Docker, CI/CD';
    line6Head = 'Security & Privacy';
    line6Vals = 'OAuth2, JWT, Audit Logging, SOC2, HIPAA Safeguards, RBAC';
  } else if (domain === 'ai') {
    line1Head = 'AI & Agents';
    line1Vals = 'LangGraph, Model Context Protocol (MCP), LangChain, RAG, Azure OpenAI, DSPy';
    line3Head = 'Backend & Web';
    line3Vals = 'FastAPI, React.js, REST APIs, gRPC, Node.js, Express, Celery, Docker, Kubernetes';
    line4Head = 'Vector Search';
    line4Vals = 'ChromaDB, Pinecone, Hybrid Search, Dense Embeddings, BM25, Cross-Encoder Reranking';
    line5Head = 'Databases & Cloud';
    line5Vals = 'PostgreSQL, DynamoDB, Redis, MongoDB, AWS, Azure, Docker, CI/CD';
    line6Head = 'Security & Observability';
    line6Vals = 'OAuth2, JWT, SSO, RBAC, Grafana, Prometheus, Structured Logging';
  } else if (domain === 'fullstack') {
    line1Head = 'Frontend';
    line1Vals = 'React.js, Next.js, TypeScript, JavaScript, Tailwind CSS, WebSockets, Redux';
    line3Head = 'Backend';
    line3Vals = 'Node.js, Express, FastAPI, REST APIs, GraphQL, gRPC, Microservices';
    line4Head = 'AI & Search';
    line4Vals = 'LangChain, LangGraph, Model Context Protocol (MCP), RAG, Azure OpenAI, ChromaDB, Pinecone';
    line5Head = 'Databases & Cloud';
    line5Vals = 'PostgreSQL, DynamoDB, Redis, MongoDB, AWS (ECS, S3, Lambda), Azure, Docker, CI/CD';
    line6Head = 'Security & Testing';
    line6Vals = 'OAuth2, SSO, RBAC, JWT, Docker, CI/CD, Jest, React Testing Library';
  } else if (domain === 'cloud') {
    line1Head = 'Cloud & Infrastructure';
    line1Vals = 'AWS (Lambda, ECS, S3, IAM, CloudWatch), Azure, Docker, Kubernetes, Terraform';
    line3Head = 'Backend & Web';
    line3Vals = 'FastAPI, React.js, gRPC, REST APIs, Linux, Docker, Microservices';
    line4Head = 'Observability';
    line4Vals = 'Prometheus, Grafana, OpenTelemetry, Distributed Tracing, Structured Logging';
    line5Head = 'Databases';
    line5Vals = 'PostgreSQL, DynamoDB, Redis, MongoDB, ChromaDB, Pinecone';
    line6Head = 'Security & DevOps';
    line6Vals = 'SSO, RBAC, OAuth2, GitHub Actions, CI/CD Automation, Vault';
  } else if (domain === 'security') {
    line1Head = 'Security & Identity';
    line1Vals = 'OAuth2, SSO, RBAC, JWT, Multi-Tenant Isolation, Audit Logging, SOC2, HIPAA';
    line3Head = 'Backend & Web';
    line3Vals = 'FastAPI, React.js, REST APIs, gRPC, Node.js, Express, Docker, Kubernetes';
    line4Head = 'AI & Search';
    line4Vals = 'RAG, LangChain, LangGraph, Model Context Protocol (MCP), Dense Embeddings, ChromaDB, Pinecone';
    line5Head = 'Databases & Cloud';
    line5Vals = 'PostgreSQL, DynamoDB, Redis, MongoDB, AWS, Azure, Terraform, CI/CD';
    line6Head = 'Reliability & Auditing';
    line6Vals = 'Grafana, Structured Logging, CI/CD, Idempotency, Prometheus';
  } else if (domain === 'ml') {
    line1Head = 'Machine Learning';
    line1Vals = 'NVIDIA Triton Inference Server, PyTorch, TensorFlow, DenseNet-121, MONAI, Model Serving';
    line3Head = 'Backend & Web';
    line3Vals = 'FastAPI, React.js, gRPC, REST APIs, Docker, Linux, Celery, Microservices';
    line4Head = 'AI & Retrieval';
    line4Vals = 'RAG, LangChain, Dense Embeddings, Semantic Search, ChromaDB, Pinecone, DSPy';
    line5Head = 'Databases & Cloud';
    line5Vals = 'PostgreSQL, DynamoDB, Redis, AWS (ECS, S3), Azure, GPU Clusters';
    line6Head = 'Observability & Reliability';
    line6Vals = 'Grafana, Prometheus, Structured Logging, Model Evaluation, CI/CD';
  }

  return `\\sectionhead{Technical Skills}
\\skillline{${esc(line1Head)}}{${esc(line1Vals)}}
\\skillline{${esc(line2Head)}}{${esc(line2Vals)}}
\\skillline{${esc(line3Head)}}{${esc(line3Vals)}}
\\skillline{${esc(line4Head)}}{${esc(line4Vals)}}
\\skillline{${esc(line5Head)}}{${esc(line5Vals)}}
\\skillline{${esc(line6Head)}}{${esc(line6Vals)}}`;
}

// 5. Generic Standard Summary Generator
export function generateGenericSummary(roleTitle: string, domain: RoleDomain, jdText?: string): string {
  const text = (jdText || '').toLowerCase();
  
  if (domain === 'data' || /analytics|dbt/i.test(text)) {
    return `${roleTitle} with 5+ years of professional software engineering experience building scalable data transformation pipelines, dimensional models, and high-performance analytics infrastructure. Experienced in SQL, dbt, Python, Airflow, and cloud database architectures. Engineered automated ETL workflows, dimensional models for business analytics, and reliable data pipelines from design through production delivery.`;
  }
  if (domain === 'healthcare') {
    return `${roleTitle} with 5+ years of professional software engineering experience building healthcare data exchange interfaces, clinical decision support platforms, and medical imaging pipelines. Experienced in Python, FastAPI, DICOM standards, HIPAA security compliance, and cloud health infrastructure. Engineered patient record APIs, automated medical guidelines retrieval, and resilient clinical services from design through production delivery.`;
  }
  if (domain === 'ai') {
    return `${roleTitle} with 5+ years of professional software engineering experience building agentic workflows, LLM orchestration layers, and high-performance retrieval architectures. Experienced in Python, LangGraph, Model Context Protocol (MCP), vector databases, and Azure OpenAI infrastructure. Engineered autonomous reasoning systems, semantic search pipelines, and enterprise AI integrations from design through production delivery.`;
  }
  if (domain === 'fullstack') {
    return `${roleTitle} with 5+ years of professional software engineering experience building interactive web applications, real-time collaboration interfaces, and high-performance APIs. Experienced in TypeScript, React.js, Next.js, Node.js, and cloud database architectures. Engineered dynamic application flows, WebSocket streaming layers, and multi-tenant authenticated workflows from design through production delivery.`;
  }
  if (domain === 'cloud') {
    return `${roleTitle} with 5+ years of professional software engineering experience building cloud infrastructure, automated delivery pipelines, and distributed observability platforms. Experienced in AWS, Azure, Docker, Kubernetes, Terraform, and Go/Python microservices. Engineered container orchestration workflows, resilient deployment automation, and telemetry monitoring from design through production delivery.`;
  }
  if (domain === 'security') {
    return `${roleTitle} with 5+ years of professional software engineering experience building secure identity architectures, access control boundaries, and compliance automation platforms. Experienced in OAuth2, SSO, RBAC, JWT, multi-tenant data isolation, and cloud security safeguards. Engineered automated audit logging, granular permission models, and resilient backend services from design through production delivery.`;
  }
  if (domain === 'ml') {
    return `${roleTitle} with 5+ years of professional software engineering experience building high-throughput model serving pipelines, distributed inference clusters, and deep learning workflows. Experienced in Python, PyTorch, NVIDIA Triton Inference Server, container orchestration, and GPU optimization. Engineered scalable model evaluation pipelines, real-time inference services, and ML platforms from design through production delivery.`;
  }

  // Default 'distributed'
  return `${roleTitle} with 5+ years of professional software engineering experience building high-throughput APIs, distributed data pipelines, and low-latency cloud infrastructure. Experienced in Python, Go, gRPC, PostgreSQL, DynamoDB, and asynchronous event-driven architectures. Engineered distributed control planes, fault-tolerant ingestion pipelines, and resilient microservices from design through production delivery.`;
}
