# Hemanth Kumar Mangalapurapu

New York, NY (Open to Relocation · No sponsorship required) | (484) 320-7214 | hemum1808@gmail.com | [LinkedIn](https://linkedin.com/in/hemu1808) | [GitHub](https://github.com/hemu1808) | [Portfolio](https://hemu1808.github.io/swe/)

<!-- Source: candidate-designated Downloads/resume.tex, September 22, 2026. Exact supplied claims; header/email corrections authorized. -->

## Summary

AI Software Engineer with 5+ years of professional software engineering experience, building production-grade Python backend systems and enterprise LLM applications. Experienced in Retrieval-Augmented Generation (RAG), agentic workflows, distributed APIs, and cloud-native infrastructure. Built scalable AI platforms, high-throughput backend services, and end-to-end applications from model integration through production deployment.

## Technical Skills

- **Generative AI & LLMs:** Advanced RAG, LangChain, LangGraph, Model Context Protocol (MCP), DSPy
- **Machine Learning:** PyTorch, TensorFlow, MONAI, CNN (DenseNet-121), NVIDIA Triton Inference Server
- **Languages:** Go (Golang), Python, TypeScript, React.js, Next.js, SQL
- **Backend & APIs:** Node.js, Express, FastAPI, REST APIs, GraphQL, gRPC, WebSockets
- **Databases:** PostgreSQL, DynamoDB, MongoDB, Redis, ChromaDB, Pinecone
- **Cloud & DevOps:** AWS (Lambda, ECS, S3, IAM, CloudWatch), Azure, Docker, CI/CD, Terraform, Grafana, Kafka
## Experience


### LeapGenAI — Ashburn, VA

**AI Python Engineer**
*May 2025 - Present*

- Built AI-powered backend services for Seismic, a 360-degree healthcare application serving doctors and patients, supporting clinical workflows, patient data, billing, subscription management, and claims-related processes, using Python, FastAPI, and Azure OpenAI.
- Developed HIPAA-aware RAG pipelines for clinical and operational knowledge, using LangChain, document embeddings, and vector databases to retrieve relevant medical information while minimizing exposure of sensitive patient data.
- Automated multi-step clinical workflows and patient-document analysis using LangGraph and MCP, supporting downstream reasoning, care-related operations, and healthcare business processes.
- Integrated healthcare data and external systems through EHR/FHIR-based workflows and APIs, enabling structured exchange of patient records and clinical information across platform services.
- Designed AI services for medical-record processing and diagnosis-support workflows, with request routing, token controls, structured logging, and performance monitoring to improve reliability and traceability.
- Implemented safeguards around PHI and patient data handling, including access controls, secure service boundaries, and healthcare-oriented compliance practices aligned with HIPAA requirements.
- Deployed and maintained containerized healthcare services on Azure using Docker, Terraform, and GitHub Actions, owning features from backend API development through production deployment.

### SmartRevIQ — Delaware, DE

**Software Engineer**
*Aug 2023 - Apr 2025*

- Built scalable asynchronous data pipelines and REST APIs with advanced SQL modeling on PostgreSQL and AWS DynamoDB, processing 1M+ rows of enterprise pricing transactions with ease at sub-3-second query performance for analytics.
- Designed a dynamic form-rendering engine with nested validation and reusable schemas, powering new pricing UI flows across the platform and Built Dashboards with drill-down filtering, surfacing pricing analytics to identify margin leakage.
- Automated enterprise pricing workflows by deploying AI agents with LangGraph, reducing operational overhead by 80%.
- Implemented SSO authentication and Role-Based Access Control(RBAC), securing multi-tenant access to sensitive data.

### Speeler Technologies — Hyderabad, India

**Software Engineer**
*Apr 2021 -- Jul 2023*

- Architected and led the redesign of GraphQL backend services for a high-traffic e-commerce platform, implementing DataLoader-style resolver batching - AWS AppSync response caching to cut P95 latency by 30%.
- Designed a multi-tenant DynamoDB single-table architecture with sparse GSIs and composite sort keys, eliminating hot-partition bottlenecks and sustaining sub-10ms reads under high-cardinality access patterns, ensuring idempotency.
- Engineered a fault-tolerant, event-driven image-processing pipeline on AWS Lambda and SQS with dead-letter queue handling, cutting infrastructure costs by 70% while processing 2M+ monthly events at 99.99% data durability.
- Built a real-time collaborative Business Automation & Data Processing E-Commerce Platform with React and WebSockets for concurrent users, reducing perceived latency by 50ms.
- Migrated EC2 workloads to AWS ECS Fargate with Blue/Green deployments and container-level health checks wired into CI/CD, achieving zero-downtime releases across a 50K+ user production system.
- Created a TensorFlow-based demand-forecasting model for e-commerce inventory planning, visualizing forecast trends and accuracy with Matplotlib for stakeholder reporting.
## Projects


### [HemGPT - Enterprise RAG Knowledge Base | Python, LangChain, ChromaDB, Pinecone, FastAPI, React](https://github.com/hemu1808/H_ollama_gpt)

- Built a dual-mode Retrieval-Augmented Generation platform supporting both a fully local, privacy-first backend (Ollama, DSPy, ChromaDB) and a cloud backend (Pinecone), using a hybrid retrieval - dense vector search, BM25 sparse retrieval, and Reciprocal Rank Fusion re-ranking with a cross-encoder - to cut query response time.
- Architected an async ingestion pipeline with FastAPI and Celery workers using per-document-type chunking, Chain-of-Thought to maximize context relevance, embedding a 10K document corpus in under 10 minutes without blocking the UI.
- Deployed the inference layer with Server-Sent Events (SSE) streaming to eliminate perceived wait time for end users.

### [Deploy.sh - Distributed Container Orchestration Engine | Go, gRPC, PostgreSQL, Docker, Grafana](https://github.com/hemu1808/Deploysh)

- Engineered a custom distributed control plane in Go with a high-frequency gRPC heartbeat and sliding-window health state machine, cutting node-failure detection latency from ~2s to under 30ms.
- Developed a bin-packing scheduler (First-Fit Decreasing heuristic) that raised simulated hardware utilization from 50% to 80%, validated against 100+ container placement scenarios.
- Implemented a Write-Ahead Log in PostgreSQL with fsync-based durability, guaranteeing zero data loss across simulated controller-failover scenarios with recovery in under 5 seconds.
- Created a CLI and a Grafana dashboard exposing real-time cluster state and node metrics via RESTful API.

### [Sunx - AI-Powered Radiography Prediction & Clinical Decision Support | Python, PyTorch, FastAPI, Next.js](https://github.com/hemu1808/SunX)

- Built and fine-tuned a DenseNet-121 vision model achieving ~80% classification accuracy and an AUC of 0.91 across 14 chest X-ray pathology classes, served via NVIDIA Triton Inference Server for downstream clinical reasoning.
- Engineered a Retrieval-Augmented Generation layer using LangChain and pgvector (1536-dimensional embeddings) to ground treatment recommendations in real clinical guidelines (AHA/ACC, IDSA/ATS).
- Designed a HIPAA-aware DICOM ingestion and ETL (pydicom, MONAI) with PHI anonymization, backed by an async Celery-Redis task queue to keep inference non-blocking.
- Developed a Next.js/TypeScript frontend with a Cornerstone.js supporting WebGL-based pan/zoom/window-leveling.

### [ShuttleNow - Real-Time Transit Booking App | MongoDB, Express.js, React, Node.js, Redis](https://github.com/hemu1808/ShuttleNow)

- Architected a fault-tolerant booking engine that cut seat double-booking conflicts from a 12% rate under burst load to 0.5%, using Redis Redlock distributed locking with lease expiration and Optimistic Concurrency Control.
- Delivered real-time seat-inventory updates to 1,000+ concurrent clients at under 50ms latency via a bidirectional WebSocket layer instead of polling backed by MongoDB change-stream event diffing.
- Integrated Stripe payments with PCI-compliant webhook verification across both the React web app and a React Native mobile client, using serverless functions for asynchronous payment confirmation.
## Education


### Auburn University at Montgomery - Master of Science, Computer Science

*Aug 2023 - May 2025*


### MLRIT - Bachelor of Technology, Computer Science & Engineering

*Jul 2018 - Aug 2022*
