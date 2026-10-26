import type { RoleDomain, TailoredBullets } from './types.ts';
import { getCleanSkillsSection, generateGenericSummary } from './config.ts';

const esc = (s: string) => String(s).replace(/\\/g, '\\textbackslash{}').replace(/([%&#_$])/g, '\\$1');

// Verified project library
export const projects: Record<string, { header: string; url: string; bullets: string[] }> = {
  HemGPT: {
    header: 'HemGPT - Enterprise RAG Knowledge Base | Python, LangChain, ChromaDB, Pinecone, FastAPI, React',
    url: 'https://github.com/hemu1808/H_ollama_gpt',
    bullets: [
      'Built local and cloud RAG backends with Ollama, DSPy, ChromaDB, and Pinecone, combining dense retrieval, BM25, Reciprocal Rank Fusion, and cross-encoder reranking to improve retrieval.',
      'Architected asynchronous document ingestion with FastAPI and Celery, using document-specific chunking to embed a 10K document corpus in under 10 minutes without blocking the UI.',
      'Deployed Server-Sent Events streaming for the inference layer, delivering incremental responses through the application interface to eliminate perceived wait time for users.'
    ]
  },
  Deploy: {
    header: 'Deploy.sh - Distributed Container Orchestration Engine | Go, gRPC, PostgreSQL, Docker, Grafana',
    url: 'https://github.com/hemu1808/Deploysh',
    bullets: [
      'Engineered a distributed Go control plane with gRPC heartbeats and sliding-window health checks, cutting node-failure detection latency to under 30ms across simulated cluster conditions.',
      'Developed a First-Fit Decreasing bin-packing scheduler, raising simulated hardware utilization from 50% to 80% across more than 100 container-placement scenarios.',
      'Implemented PostgreSQL Write-Ahead Logging with fsync durability, preserving data across simulated controller failures and restoring control-plane operation in under 5 seconds.',
      'Created a CLI and Grafana dashboard with RESTful APIs, exposing real-time cluster state, node health, and operational metrics for distributed container infrastructure.'
    ]
  },
  Sunx: {
    header: 'Sunx - AI-Powered Radiography Prediction & Clinical Decision Support | Python, PyTorch, FastAPI, Next.js',
    url: 'https://github.com/hemu1808/SunX',
    bullets: [
      'Built and fine-tuned a DenseNet-121 vision model achieving approximately 80% accuracy and 0.91 AUC across 14 chest X-ray pathology classes, served via NVIDIA Triton Inference Server.',
      'Engineered a LangChain and pgvector RAG layer with 1536-dimensional embeddings, grounding treatment recommendations in clinical guidelines including AHA/ACC and IDSA/ATS guidance.',
      'Designed HIPAA-aware DICOM ingestion and ETL with pydicom, MONAI, PHI anonymization, and Celery-Redis queues, keeping inference non-blocking during medical-image processing.',
      'Developed a Next.js and TypeScript radiography interface with Cornerstone.js, delivering WebGL-based pan, zoom, and window-level controls for clinical image interaction.'
    ]
  },
  Shuttle: {
    header: 'ShuttleNow - Real-Time Transit Booking App | MongoDB, Express.js, React, Node.js, Redis',
    url: 'https://github.com/hemu1808/ShuttleNow',
    bullets: [
      'Architected a booking engine with Redis Redlock leases and optimistic concurrency control, cutting seat double-booking conflicts from 12% to 0.5% under burst load.',
      'Delivered seat-inventory updates to 1,000+ concurrent clients in under 50ms via a bidirectional WebSocket layer and MongoDB change-stream diffing instead of polling.',
      'Integrated Stripe payments across React web and React Native clients, securing webhook verification and asynchronous payment confirmation through serverless functions and PCI-compliant handling.'
    ]
  }
};

export function buildDeeplyTailoredBullets(company: string, domain: RoleDomain, jdText?: string): TailoredBullets {
  let leap: string[] = [];
  let smart: string[] = [];
  let speeler: string[] = [];
  let projOrder = ['Deploy', 'HemGPT', 'Shuttle', 'Sunx'];

  if (domain === 'fullstack') {
    projOrder = ['Shuttle', 'HemGPT', 'Deploy', 'Sunx'];
    leap = [
      'Built responsive clinical web interfaces and provider dashboards for Seismic, a 360-degree healthcare application serving doctors and patients, using React, TypeScript, and WebSockets to process real-time updates.',
      'Engineered modular UI component libraries and accessible design system patterns with Tailwind CSS and Next.js, enabling consistent medical records navigation while sustaining sub-100ms client rendering speeds across clinic workflows.',
      'Automated interactive clinical workflows and patient intake wizards using dynamic form schemas and LangGraph, enabling autonomous guided data capture and cutting doctor review turnaround by 40% across care teams.',
      'Integrated healthcare microservices and streaming patient event feeds through secure REST and GraphQL endpoints, sustaining 99.99% interface uptime and eliminating UI rendering freezes across live clinical interactions.',
      'Designed client-side caching and optimistic UI state management with React Query and Zustand, improving medical chart navigation throughput while eliminating blocking states across 500+ daily clinical sessions.',
      'Deployed containerized frontend web applications on Azure and CloudFront with Docker and CI/CD pipelines, delivering continuous UI feature enhancements from Figma design tokens through production delivery.'
    ];
    smart = [
      'Built scalable asynchronous data pipelines and REST APIs with advanced SQL modeling on PostgreSQL and AWS DynamoDB, processing 1M+ rows of pricing transactions with ease at sub-3-second query latency.',
      'Designed a dynamic form-rendering engine with nested validation and reusable schemas, powering 12 new interactive workflow UI flows and surfacing margin analytics across operational dashboards.',
      'Automated enterprise pricing workflows by deploying interactive AI assistant interfaces with LangGraph, reducing administrative overhead by 80% across recurring business operations and corporate customer workflows.',
      'Implemented SSO authentication and Role-Based Access Control UI workflows using JWT and OAuth2, securing multi-tenant access to sensitive enterprise data across 50+ corporate client organizations.'
    ];
    speeler = [
      'Built real-time collaborative web applications with React, TypeScript, and WebSockets, delivering concurrent-user state updates and reducing perceived UI latency by 50ms across live platform sessions.',
      'Architected GraphQL client layers with Apollo Client resolver caching and AWS AppSync, cutting P95 network payload latency by 30% for a high-traffic e-commerce storefront.',
      'Engineered reusable UI component systems and design tokens with React and CSS modules, increasing developer sprint velocity by 35% while sustaining strict WCAG 2.1 accessibility standards.',
      'Designed client-side performance monitoring and bundle-optimization pipelines with Webpack and Vite, cutting initial page load times by 45% through automated code-splitting and asset prefetching.',
      'Developed comprehensive component and integration test suites with Jest and React Testing Library, achieving 90%+ code coverage while eliminating critical regression defects across customer purchase checkout flows.',
      'Migrated monolithic frontend single-page applications to containerized micro-frontends with Docker on AWS ECS, achieving zero-downtime releases across a 50K+ active user base.'
    ];
  } else if (domain === 'data') {
    projOrder = ['Deploy', 'HemGPT', 'Shuttle', 'Sunx'];
    leap = [
      'Built backend data pipelines for Seismic, a 360-degree healthcare application serving doctors and patients, enabling structured clinical document sharing and high-throughput analytics across services with Python and FastAPI.',
      'Engineered clinical data transformation models and HIPAA-compliant feature tables with SQL and Python, enabling downstream analytics and predictive medical reporting across 100K+ patient records.',
      'Automated clinical ETL pipelines and data validation checks with Airflow and Python, reducing manual data reconciliation errors by 75% across multi-specialty healthcare business processes.',
      'Integrated hospital EHR feeds and FHIR transaction streams through secure REST APIs, sustaining 99.99% data ingestion reliability across distributed clinical data warehouse architectures.',
      'Designed asynchronous event streaming and ingestion workers with Celery, Kafka, and Redis, improving platform pipeline throughput while eliminating data loss during peak clinical intake hours.',
      'Deployed containerized data processing services on Azure with Docker and GitHub Actions, delivering production-grade data pipelines from schema migration through operational monitoring.'
    ];
    smart = [
      'Built scalable asynchronous data pipelines and REST APIs with advanced SQL modeling on PostgreSQL and AWS DynamoDB, processing 1M+ rows of pricing transactions with ease at sub-3-second query latency.',
      'Engineered analytical data transformation pipelines and dimensional models with dbt and SQL, surfacing operational metrics and delivering executive reporting dashboards for business stakeholders.',
      'Automated enterprise pricing workflows by deploying AI agents with LangGraph, reducing operational overhead by 80% across recurring business processes and platform operations.',
      'Implemented SSO authentication and Role-Based Access Control using JWT and OAuth2, securing multi-tenant access to sensitive enterprise data across corporate accounts.'
    ];
    speeler = [
      'Engineered high-throughput transactional data pipelines on PostgreSQL and DynamoDB, sustaining sub-10ms query latency while processing 2M+ monthly e-commerce records with zero data corruption.',
      'Architected data ingestion APIs with GraphQL and AWS AppSync response caching, cutting analytical report generation latency by 30% for executive stakeholders.',
      'Built event-driven data streaming pipelines with AWS Lambda and SQS, cutting infrastructure costs by 70% while sustaining 99.99% data pipeline durability across burst order periods.',
      'Designed automated data quality validation and schema enforcement checks with Python and SQL, eliminating inconsistent transaction records before ingestion into central reporting stores.',
      'Migrated legacy ETL database batch jobs to containerized task workers on AWS ECS Fargate, achieving zero-downtime releases and speeding daily aggregation runs by 40%.',
      'Created a TensorFlow demand-forecasting model for e-commerce inventory planning, using Matplotlib to surface forecast trends for stakeholder reporting and operational analysis.'
    ];
  } else if (domain === 'cloud') {
    projOrder = ['Deploy', 'HemGPT', 'Sunx', 'Shuttle'];
    leap = [
      'Built scalable microservices and operational cloud infrastructure for Seismic, a 360-degree healthcare application serving doctors and patients, delivering containerized services with Python, FastAPI, and Docker.',
      'Architected multi-region Kubernetes deployments and Terraform infrastructure-as-code modules on Azure, achieving automated cluster provisioning while reducing infrastructure deployment turnaround by 60%.',
      'Automated CI/CD build, testing, and deployment pipelines using GitHub Actions and Helm, enabling zero-downtime releases across staging and production healthcare environments.',
      'Integrated distributed tracing and system metrics collection using OpenTelemetry, Prometheus, and Grafana, sustaining 99.99% platform availability across all connected clinical microservices.',
      'Designed asynchronous medical document processing workers with Celery and Redis, improving platform ingestion throughput while eliminating API blocking across services.',
      'Deployed containerized healthcare microservices on Azure and Kubernetes using Docker and CI/CD pipelines, delivering resilient features from backend API design through production delivery.'
    ];
    smart = [
      'Built scalable asynchronous data pipelines and REST APIs with advanced SQL modeling on PostgreSQL and AWS DynamoDB, processing 1M+ rows of pricing transactions with ease at sub-3-second query latency.',
      'Designed a dynamic form-rendering engine with nested validation and reusable schemas, powering 12 new interactive workflow UI flows and surfacing operational analytics.',
      'Automated enterprise pricing workflows by deploying AI agents with LangGraph, reducing operational overhead by 80% across recurring business processes and platform operations.',
      'Implemented SSO authentication and Role-Based Access Control using JWT and OAuth2, securing multi-tenant access to sensitive enterprise data across corporate accounts.'
    ];
    speeler = [
      'Migrated EC2 workloads to AWS ECS Fargate with blue/green deployments, container health checks, and CI/CD, achieving zero-downtime releases across a 50K+ user system.',
      'Architected AWS AppSync and Lambda microservices with CloudWatch metrics and alarms, cutting system incident resolution times by 40% through automated alerting.',
      'Engineered event-driven image-processing pipelines with AWS Lambda, SQS, and dead-letter handling, cutting infrastructure costs by 70% while processing 2M+ monthly events at 99.99% data durability.',
      'Designed multi-tenant DynamoDB single-table storage with sparse GSIs and composite sort keys, eliminating hot partitions while sustaining sub-10ms reads and idempotent operations.',
      'Built automated infrastructure deployment scripts using Terraform and Docker, achieving reproducible development environments and cutting developer onboarding time by 50%.',
      'Created automated disaster recovery and data backup workflows for PostgreSQL, validating data durability across simulated controller outages and restoring services in under 5 minutes.'
    ];
  } else if (domain === 'ml') {
    projOrder = ['Sunx', 'HemGPT', 'Deploy', 'Shuttle'];
    leap = [
      'Built distributed ML training and model evaluation pipelines for Seismic, a 360-degree healthcare application serving doctors and patients, using Python, PyTorch, and FastAPI to surface diagnostic insights.',
      'Engineered high-throughput model serving pipelines with NVIDIA Triton and vector databases, cutting P95 inference latency by 45% while maintaining strict clinical evaluation benchmarks.',
      'Automated multi-step clinical reasoning and document analysis workflows using LangGraph and Model Context Protocol (MCP), enabling autonomous agent decision support across healthcare operations.',
      'Integrated healthcare APIs and patient records through secure REST endpoints, enabling structured model evaluation and sustaining 99.99% service availability across platform services.',
      'Designed asynchronous ML feature extraction and embedding pipelines with Celery and Redis, improving batch processing throughput while eliminating inference latency spikes.',
      'Deployed containerized healthcare microservices on Azure with Docker and GitHub Actions, delivering features from backend API design through production delivery.'
    ];
    smart = [
      'Built scalable asynchronous data pipelines and REST APIs with advanced SQL modeling on PostgreSQL and AWS DynamoDB, processing 1M+ rows of pricing transactions with ease at sub-3-second query latency.',
      'Designed a dynamic form-rendering engine with nested validation and reusable schemas, powering 12 new interactive workflow UI flows and surfacing operational analytics.',
      'Automated enterprise pricing workflows by deploying AI agents with LangGraph, reducing operational overhead by 80% across recurring business processes and platform operations.',
      'Implemented SSO authentication and Role-Based Access Control using JWT and OAuth2, securing multi-tenant access to sensitive enterprise data across corporate accounts.'
    ];
    speeler = [
      'Created a TensorFlow demand-forecasting model for e-commerce inventory planning, using Matplotlib to surface forecast trends for stakeholder reporting and operational analysis.',
      'Architected GraphQL backend services with DataLoader-style resolver batching and AWS AppSync response caching, cutting P95 latency by 30% for a high-traffic e-commerce platform.',
      'Designed multi-tenant DynamoDB single-table storage with sparse GSIs and composite sort keys, eliminating hot partitions while sustaining sub-10ms reads and idempotent operations.',
      'Engineered event-driven image-processing pipelines with AWS Lambda, SQS, and dead-letter handling, cutting infrastructure costs by 70% while processing 2M+ monthly events at 99.99% data durability.',
      'Built real-time collaborative e-commerce interfaces with React and WebSockets, delivering concurrent-user updates and reducing perceived latency by 50ms across application interactions.',
      'Migrated EC2 workloads to AWS ECS Fargate with blue/green deployments, container health checks, and CI/CD, achieving zero-downtime releases across a 50K+ user system.'
    ];
  } else if (domain === 'healthcare') {
    projOrder = ['Sunx', 'HemGPT', 'Deploy', 'Shuttle'];
    leap = [
      'Architected healthcare data exchange interfaces and patient record APIs for Seismic, a 360-degree healthcare application serving doctors and patients, using Python and FastAPI, enabling structured clinical document sharing across 100K+ patient files.',
      'Engineered clinical decision support retrieval pipelines using LangChain, vector databases, and dense embeddings, grounding automated recommendations in medical guidelines to cut review latency by 45%.',
      'Automated clinical guideline extraction and diagnostic verification workflows with Model Context Protocol, reducing physician review turnaround times by 40% across 15+ complex medical specialties.',
      'Integrated hospital EHR interfaces and laboratory information systems through secure REST APIs and HL7 feeds, sustaining 99.9% uptime across connected health services.',
      'Designed asynchronous medical document processing workers with Celery and Redis, improving platform ingestion throughput by 35% while eliminating API blocking.',
      'Deployed containerized clinical microservices on cloud infrastructure using Docker, Kubernetes, and CI/CD pipelines, achieving zero-downtime releases across 4 production healthcare environments.'
    ];
    smart = [
      'Built scalable asynchronous data pipelines and REST APIs with advanced SQL modeling on PostgreSQL and AWS DynamoDB, processing 1M+ rows of pricing transactions with ease at sub-3-second query latency.',
      'Designed a dynamic form-rendering engine with nested validation and reusable schemas, powering 12 new interactive workflow UI flows and surfacing operational metrics.',
      'Automated clinical data review workflows by deploying responsive AI agents with LangGraph, reducing operational administrative overhead by 80% across 500+ daily clinical cases.',
      'Implemented SSO authentication and Role-Based Access Control using JWT and OAuth2, securing multi-tenant access to sensitive patient records across 50+ enterprise customer accounts.'
    ];
    speeler = [
      'Architected GraphQL backend services with DataLoader-style resolver batching and AWS AppSync response caching, cutting P95 latency by 30% for a high-traffic e-commerce platform.',
      'Designed multi-tenant DynamoDB single-table storage with sparse GSIs and composite sort keys, eliminating hot partitions while sustaining sub-10ms reads and idempotent operations.',
      'Engineered event-driven image-processing pipelines with AWS Lambda, SQS, and dead-letter handling, cutting infrastructure costs by 70% while processing 2M+ monthly events at 99.99% data durability.',
      'Built real-time collaborative e-commerce interfaces with React and WebSockets, delivering concurrent-user updates and reducing perceived latency by 50ms across application interactions.',
      'Migrated EC2 workloads to AWS ECS Fargate with blue/green deployments, container health checks, and CI/CD, achieving zero-downtime releases across a 50K+ user system.',
      'Created a TensorFlow demand-forecasting model for e-commerce inventory planning, using Matplotlib to surface forecast trends for stakeholder reporting and operational analysis.'
    ];
  } else if (domain === 'security') {
    projOrder = ['Deploy', 'HemGPT', 'Shuttle', 'Sunx'];
    leap = [
      'Built secure healthcare backend services and access boundaries for Seismic, a 360-degree healthcare application serving doctors and patients, using Python, FastAPI, and OAuth2 to safeguard patient data.',
      'Engineered HIPAA-compliant audit logging and PHI access controls with encrypted tokens and Redis, sustaining 99.99% security compliance across all clinical transactions.',
      'Automated security policy enforcement and vulnerability scans across microservices with CI/CD pipelines, reducing credential exposure risks by 85% across cloud environments.',
      'Integrated hospital EHR and FHIR workflows across connected healthcare services through secure REST APIs, sustaining 99.99% service availability across platform integrations.',
      'Designed asynchronous medical document processing workers with Celery and Redis, improving platform ingestion throughput while eliminating API blocking across services.',
      'Deployed containerized healthcare microservices on Azure with Docker and GitHub Actions, delivering features from backend API design through production delivery.'
    ];
    smart = [
      'Built scalable asynchronous data pipelines and REST APIs with advanced SQL modeling on PostgreSQL and AWS DynamoDB, processing 1M+ rows of pricing transactions with ease at sub-3-second query latency.',
      'Designed a dynamic form-rendering engine with nested validation and reusable schemas, powering 12 new interactive workflow UI flows and surfacing operational analytics.',
      'Automated enterprise pricing workflows by deploying AI agents with LangGraph, reducing operational overhead by 80% across recurring business processes and platform operations.',
      'Implemented SSO authentication and Role-Based Access Control using JWT and OAuth2, securing multi-tenant access to sensitive enterprise data across corporate accounts.'
    ];
    speeler = [
      'Implemented role-based authorization and cryptographic session management with JWT and OAuth2, securing sensitive e-commerce transaction APIs across 50K+ user accounts.',
      'Architected GraphQL backend services with DataLoader-style resolver batching and AWS AppSync response caching, cutting P95 latency by 30% for a high-traffic e-commerce platform.',
      'Designed multi-tenant DynamoDB single-table storage with sparse GSIs and composite sort keys, eliminating hot partitions while sustaining sub-10ms reads and idempotent operations.',
      'Engineered event-driven image-processing pipelines with AWS Lambda, SQS, and dead-letter handling, cutting infrastructure costs by 70% while processing 2M+ monthly events at 99.99% data durability.',
      'Built automated vulnerability scanning and secrets detection in CI/CD with GitHub Actions, eliminating insecure dependency risks before production releases.',
      'Migrated EC2 workloads to AWS ECS Fargate with blue/green deployments, container health checks, and CI/CD, achieving zero-downtime releases across a 50K+ user system.'
    ];
  } else if (domain === 'ai') {
    projOrder = ['HemGPT', 'Sunx', 'Deploy', 'Shuttle'];
    leap = [
      'Built AI-powered backend microservices and agent workflows for Seismic, a 360-degree healthcare application serving doctors and patients, using Python, FastAPI, and Azure OpenAI, delivering automated clinical reasoning and decision support.',
      'Developed HIPAA-aware RAG pipelines for clinical knowledge retrieval, using LangChain and vector databases to surface medical guidelines while safeguarding sensitive patient data.',
      'Automated multi-step clinical reasoning and document analysis workflows using LangGraph and Model Context Protocol (MCP), enabling autonomous agent decision support across healthcare operations.',
      'Integrated healthcare APIs and patient records through secure REST endpoints, enabling structured LLM tool-calling and sustaining 99.99% service availability across platform services.',
      'Designed asynchronous LLM inference queues and token-budgeting workers with Celery and Redis, improving platform ingestion throughput while eliminating timeout failures during high-traffic clinical usage.',
      'Deployed containerized healthcare microservices on Azure with Docker and GitHub Actions, delivering features from backend API design through production delivery.'
    ];
    smart = [
      'Built scalable asynchronous data pipelines and REST APIs with advanced SQL modeling on PostgreSQL and AWS DynamoDB, processing 1M+ rows of pricing transactions with ease at sub-3-second query latency.',
      'Designed a dynamic form-rendering engine with nested validation and reusable schemas, powering 12 new interactive workflow UI flows and surfacing operational analytics.',
      'Automated enterprise pricing workflows by deploying AI agents with LangGraph, reducing operational overhead by 80% across recurring business processes and platform operations.',
      'Implemented SSO authentication and Role-Based Access Control using JWT and OAuth2, securing multi-tenant access to sensitive enterprise data across corporate accounts.'
    ];
    speeler = [
      'Architected GraphQL backend services with DataLoader-style resolver batching and AWS AppSync response caching, cutting P95 latency by 30% for a high-traffic e-commerce platform.',
      'Designed multi-tenant DynamoDB single-table storage with sparse GSIs and composite sort keys, eliminating hot partitions while sustaining sub-10ms reads and idempotent operations.',
      'Engineered event-driven image-processing pipelines with AWS Lambda, SQS, and dead-letter handling, cutting infrastructure costs by 70% while processing 2M+ monthly events at 99.99% data durability.',
      'Built real-time collaborative e-commerce interfaces with React and WebSockets, delivering concurrent-user updates and reducing perceived latency by 50ms across application interactions.',
      'Migrated EC2 workloads to AWS ECS Fargate with blue/green deployments, container health checks, and CI/CD, achieving zero-downtime releases across a 50K+ user system.',
      'Created a TensorFlow demand-forecasting model for e-commerce inventory planning, using Matplotlib to surface forecast trends for stakeholder reporting and operational analysis.'
    ];
  } else {
    // Default 'distributed'
    projOrder = ['Deploy', 'HemGPT', 'Shuttle', 'Sunx'];
    leap = [
      'Built high-concurrency distributed backend microservices for Seismic, a 360-degree healthcare application serving doctors and patients, using Python, FastAPI, and gRPC to process high-throughput clinical transactions.',
      'Engineered distributed caching and state synchronization pipelines with Redis and PostgreSQL, sustaining sub-15ms data access and reducing backend database load by 40% across clinical services.',
      'Automated multi-step clinical workflows and patient-document analysis with LangGraph and MCP, enabling downstream reasoning across complex healthcare business processes.',
      'Integrated hospital EHR and FHIR workflows across connected healthcare services through secure REST APIs, sustaining 99.99% service availability across platform integrations.',
      'Designed asynchronous medical document processing workers with Celery and Redis, improving platform ingestion throughput while eliminating API blocking across services.',
      'Deployed containerized healthcare microservices on Azure with Docker and GitHub Actions, delivering features from backend API design through production delivery.'
    ];
    smart = [
      'Built scalable asynchronous data pipelines and REST APIs with advanced SQL modeling on PostgreSQL and AWS DynamoDB, processing 1M+ rows of pricing transactions with ease at sub-3-second query latency.',
      'Designed a dynamic form-rendering engine with nested validation and reusable schemas, powering 12 new interactive workflow UI flows and surfacing operational analytics.',
      'Automated enterprise pricing workflows by deploying AI agents with LangGraph, reducing operational overhead by 80% across recurring business processes and platform operations.',
      'Implemented SSO authentication and Role-Based Access Control using JWT and OAuth2, securing multi-tenant access to sensitive enterprise data across corporate accounts.'
    ];
    speeler = [
      'Architected GraphQL backend services with DataLoader-style resolver batching and AWS AppSync response caching, cutting P95 latency by 30% for a high-traffic e-commerce platform.',
      'Designed multi-tenant DynamoDB single-table storage with sparse GSIs and composite sort keys, eliminating hot partitions while sustaining sub-10ms reads and idempotent operations.',
      'Engineered event-driven image-processing pipelines with AWS Lambda, SQS, and dead-letter handling, cutting infrastructure costs by 70% while processing 2M+ monthly events at 99.99% data durability.',
      'Built real-time collaborative e-commerce interfaces with React and WebSockets, delivering concurrent-user updates and reducing perceived latency by 50ms across application interactions.',
      'Migrated EC2 workloads to AWS ECS Fargate with blue/green deployments, container health checks, and CI/CD, achieving zero-downtime releases across a 50K+ user system.',
      'Created a distributed C++ network daemon for embedded Linux services, achieving reliable IPC messaging and sub-5ms transaction logging across connected edge devices.'
    ];
  }

  return { leap, smart, speeler, projOrder };
}

export function generateTailoredLaTeX(
  masterTex: string,
  company: string,
  roleTitle: string,
  domain: RoleDomain,
  hqLocation: string,
  jdText?: string
): string {
  let tex = masterTex;
  const summary = generateGenericSummary(roleTitle, domain, jdText);
  const skillsBlock = getCleanSkillsSection(domain, jdText);
  const { leap, smart, speeler, projOrder } = buildDeeplyTailoredBullets(company, domain, jdText);

  // 1. Header: <City, ST> \textbullet\ No sponsorship required \textbullet\ ...
  tex = tex.replace(
    /\\begin\{center\}[\s\S]*?\\end\{center\}/,
    `\\begin{center}
  {\\Large\\bfseries Hemanth Kumar Mangalapurapu}\\\\
  {${hqLocation} \\textbullet\\ No sponsorship required \\textbullet\\ (484) 320-7214 \\textbullet\\
  \\href{mailto:hemum1808@gmail.com}{hemum1808@gmail.com}\\\\
  \\href{https://linkedin.com/in/hemu1808}{linkedin.com/in/hemu1808} \\textbullet\\
  \\href{https://github.com/hemu1808}{github.com/hemu1808} \\textbullet\\
  \\href{https://hemu1808.github.io/swe/}{Portfolio}}
\\end{center}`
  );

  // 2. Summary
  tex = tex.replace(/(\\sectionhead\{Summary\}\s*\n)[\s\S]*?(\n\\vspace\{-3pt\})/, (_, a, b) => a + esc(summary) + b);

  // 3. Technical Skills
  tex = tex.replace(/(\\sectionhead\{Technical Skills\}[\s\S]*?)(\\vspace\{-3pt\})/, () => skillsBlock + '\n\\vspace{-3pt}');

  // 4. Experience Bullets (Deeply tailored with Seismic & SmartRev 1M+ rows)
  const leapItems = leap.map(b => `\\item ${esc(b)}`).join('\n');
  const smartItems = smart.map(b => `\\item ${esc(b)}`).join('\n');
  const speelerItems = speeler.map(b => `\\item ${esc(b)}`).join('\n');

  tex = tex.replace(/(\\entryheader\{LeapGenAI[^\n{}]*\}\{[^\n{}]*\}\s*\\begin\{tightitemize\})[\s\S]*?(\\end\{tightitemize\})/, (_, a, b) => a + '\n' + leapItems + '\n' + b);
  tex = tex.replace(/(\\entryheader\{SmartRevIQ[^\n{}]*\}\{[^\n{}]*\}\s*\\begin\{tightitemize\})[\s\S]*?(\\end\{tightitemize\})/, (_, a, b) => a + '\n' + smartItems + '\n' + b);
  tex = tex.replace(/(\\entryheader\{Speeler Technologies[^\n{}]*\}\{[^\n{}]*\}\s*\\begin\{tightitemize\})[\s\S]*?(\\end\{tightitemize\})/, (_, a, b) => a + '\n' + speelerItems + '\n' + b);

  // 5. Projects
  let pi = 0;
  tex = tex.replace(/\\projectheader\{[^\n{}]+\}\{[^\n{}]+\}\s*\\begin\{tightitemize\}[\s\S]*?\\end\{tightitemize\}/g, () => {
    const p = projects[projOrder[pi++]];
    return `\\projectheader{${esc(p.header)}}{${p.url}}\n\\begin{tightitemize}\n${p.bullets.map(b => `\\item ${esc(b)}`).join('\n')}\n\\end{tightitemize}`;
  });

  return tex;
}
