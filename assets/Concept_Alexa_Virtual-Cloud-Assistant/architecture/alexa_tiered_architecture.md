# Alexa Tiered Service — AWS Architecture

How a user reaches the assistant through three tiers (Physical, Digital, Spatial), and how all three run on one shared AWS backend that serves a catalog of SaaS apps.

Files: `alexa_tiered_architecture.drawio` (editable) · `alexa_tiered_architecture.png` (3840×2160) · `alexa_tiered_architecture.svg`.
Icons are draw.io's built-in **AWS Architecture Icons** (`mxgraph.aws4.*`), with AWS's official category colours.

## Services

### Tier 1 — Physical (audio only, any phone)

| Service | Purpose |
|---|---|
| Amazon Connect | Receives the inbound toll-free voice call. Telephony entry point. |
| Amazon Transcribe | Streaming speech to text. |
| Amazon Lex | Conversation and intent handling. |
| Amazon Polly | Text to speech for the spoken reply. |

### Tier 2 — Digital (screens and apps)

| Service | Purpose |
|---|---|
| Alexa Skills Kit | Entry for Echo devices (Echo Show). |
| AWS WAF | Web firewall in front of Amazon CloudFront and Amazon API Gateway. |
| Amazon CloudFront | Delivers the web/mobile app front end. |
| AWS Amplify | Hosts the web/mobile app front end. |
| Amazon API Gateway | API entry for the apps. |
| Amazon Cognito | User sign-in. |

### Tier 3 — Spatial (interface projected into the room)

| Service | Purpose |
|---|---|
| AWS IoT Greengrass | Runs on the spatial device: on-device processing of infrared/depth data. |
| AWS IoT Core | Secure device connection (MQTT, mutual TLS). Receives short event messages only. |

### Shared AWS core (used by all tiers)

| Service | Purpose |
|---|---|
| AWS Lambda | Business logic and orchestration. |
| Amazon Bedrock (Amazon Nova Micro) | Answer generation. |
| Amazon DynamoDB | User profiles, consent records, session state. |
| Amazon S3 | Content, offline emergency guidance packs, logs. |
| Amazon EventBridge | Routes events (alerts, emergencies) between services. |
| Amazon SNS | SMS and push alerts (weather, power cuts, irrigation). |
| Amazon Location Service | Maps and exit routes for safety projection. |
| AWS KMS | Encryption keys. |
| Amazon CloudWatch | Monitoring. |
| Amazon API Gateway (catalog API) | Connects the shared core to the SaaS app catalog. |

### Outside AWS

| Item | Notes |
|---|---|
| Users and devices | Basic feature phone (ordinary toll-free call), smartphone, tablet, TV / home screen, laptop, Echo Show. |
| Spatial device (customer premises) | Projector, infrared depth sensor, microphones, battery backup. Runs AWS IoT Greengrass. |
| User's phone + cellular network | Used only on the emergency path. |
| SaaS app catalog | Built from Amazon startup-cluster tools: Amazon Quick (example app), Weather, Sous Chef, Prime Video, other apps. |

Items with no official AWS icon (feature phone, TV, projector, microphones, battery, cellular network, the non-AWS apps) are drawn as labelled boxes or generic AWS client icons, not as AWS services.

## Numbered flows

1. Caller dials the toll-free number; Amazon Connect answers.
2. Connect streams speech to Amazon Transcribe; Amazon Lex handles the intent.
3. Lex hands the intent to AWS Lambda.
4. Lambda asks Amazon Bedrock (Amazon Nova Micro) for the answer.
5. Lambda → Amazon Polly → Connect: the caller hears the answer.
6. Echo Show → Alexa Skills Kit → Lambda.
7. Apps → AWS WAF → Amazon CloudFront → AWS Amplify (front end).
8. Apps → AWS WAF → Amazon API Gateway → Lambda; sign-in with Amazon Cognito.
9. Laptop as an extension display: laptop → home screen, via the app.
10. AWS IoT Greengrass processes infrared/depth data on the device.
11. Event messages only (presence, fall, hazard) → AWS IoT Core → Amazon EventBridge → Lambda.
12. Lambda ↔ Amazon DynamoDB (profiles, consent, sessions) and Amazon S3 (content, offline packs, logs).
13. EventBridge → Amazon SNS → SMS and push alerts to users' phones.
14. Lambda → API Gateway (catalog API) → SaaS app catalog.
15. **Emergency:** device → user's phone (Bluetooth or phone hotspot) → cellular network → AWS IoT Core → EventBridge → Lambda.
16. **Emergency:** Lambda → Amazon Location Service → back via IoT Core and the phone → the device projects exit routes.
17. **Emergency fallback:** if the phone link is unavailable, the device uses local audio and the offline guidance pack already stored on it.

Flows 15–17 are drawn as a dashed orange line: home power and Wi-Fi are down and the spatial device runs on battery. *Emergency only. Separate account-holder consent.*

## Privacy and security boundaries

- **On-device only:** a dashed boundary around the infrared/depth sensor and AWS IoT Greengrass. Raw infrared/depth data never leaves the device; no line carries raw sensor data to the cloud.
- **Account-holder consent required:** on the spatial device and on the emergency link.
- **No identity, no stored imagery:** on the sensing pipeline.
- AWS KMS encrypts stored data; Amazon CloudWatch monitors every service.

---
All rights reserved © greateagledesigns.com | gaurav.dalbhanjan@gmail.com
