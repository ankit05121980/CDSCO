# External Integrations (35 systems)

DDRS integrates with 35 government and external systems (RFP Appendix 3). In
this demonstration build, each is served by a **simulated adapter** that returns
realistic responses with artificial latency and writes an entry to the
integration log. The console is available at **Admin/CDSCO → Integrations**, and
each adapter can be invoked live via the **Test** button.

| Key | System | Purpose | Direction |
| --- | ------ | ------- | --------- |
| AADHAAR | Aadhaar / UIDAI | e-KYC & authentication | Bidirectional |
| PAN | PAN (Income Tax) | PAN verification | Incoming |
| DIGILOCKER | DigiLocker | Document issuance & e-sign | Bidirectional |
| GSTN | GST Network | GSTIN, invoices, e-waybill | Incoming |
| BHARAT_KOSH | Bharat Kosh (pay.gov.in) | Fee remittance to CFI | Bidirectional |
| STATE_TREASURY | State Treasuries | State fee collection | Bidirectional |
| ICEGATE | Customs / ICEGATE | Import clearance | Bidirectional |
| DGFT | DGFT | Export, advance licence, FSC | Incoming |
| BIS | Bureau of Indian Standards | Standards in workflows | Incoming |
| CTRI | CTRI (ICMR) | Clinical trial registration | Bidirectional |
| ICMR | ICMR | Ethics committee & IVD testing | Bidirectional |
| NPPA | NPPA / IPDMS | Drug pricing & availability | Incoming |
| ABDM | Ayushman Bharat Digital Mission | HFR / HPR registry | Bidirectional |
| QCI | Quality Council of India | NABL labs & notified bodies | Bidirectional |
| GEM | GeM | Licence verification | Outgoing |
| FSSAI | FSSAI | Licence verification | Bidirectional |
| CBN | Central Bureau of Narcotics | Narcotics quotas & NOCs | Incoming |
| NIB | National Institute of Biologicals | Biological testing & HvPI | Incoming |
| IPC | Indian Pharmacopoeia Commission | IP standards, PvPI/MvPI | Incoming |
| LEGAL_METROLOGY | Legal Metrology Dept | Measuring devices | Incoming |
| INC | Indian Nursing Council | Nurse verification | Incoming |
| NMC | National Medical Commission | Practitioner verification | Incoming |
| CPCB | Pollution Control Board | Licence verification | Incoming |
| FACTORIES | Inspectorate of Factories | Licence verification | Incoming |
| COMMERCE | Department of Commerce | Import-Export Data Bank | Bidirectional |
| DSIR | Dept of Scientific & Industrial Research | R&D site approval | Incoming |
| RCGM | Review Committee on Genetic Manipulation | rDNA clearances | Incoming |
| AERB | Atomic Energy Regulatory Board | Radiation device NOC | Incoming |
| MCA | MCA / Registrar of Companies | CIN verification | Incoming |
| ONDC | ONDC | Commerce signals | Bidirectional |
| CDAC_ESIGN | CDAC eSign / DSC | Digital signatures | Bidirectional |
| SMS_GATEWAY | SMS Gateway | OTP & alert SMS | Outgoing |
| EMAIL_GATEWAY | Email Gateway | Email notifications | Outgoing |
| E_AUSHADHI | E-Aushadhi (State) | Lab sample reports | Bidirectional |
| DGCIS | DGCI&S | Commercial intelligence | Incoming |

## Invoking an adapter

```
POST /api/integrations/invoke
{ "system": "GSTN", "payload": { "value": "27ABCDE1234F1Z5" } }
```

Returns a realistic mock response, persists an `integration_logs` row, and is
visible in the Integrations console. To go live, replace the `mockResponse()`
logic in `backend/src/modules/integrations/integrations.service.ts` with real
API clients and credentials.
