# Product Requirement Document (PRD): Integrated Billing & Prescription Module (POS)

## 1. Document Overview
* **Feature Name:** Clinical Billing & Medication Management
* **Status:** Draft
* **Priority:** High
* **Domain:** Healthcare Management Systems / Point of Sale (POS)

## 2. Objective
To streamline the post-consultation workflow by integrating clinical findings (chief complaints and treatments) with a detailed prescription engine and billing system. The goal is to allow staff to generate comprehensive invoices and prescription slips in a single, unified interface immediately following a doctor’s visit.

## 3. User Personas
* **Front-Desk/Receptionist:** Responsible for entering patient data and processing payments.
* **Doctor/Medical Assistant:** Responsible for inputting clinical complaints, treatments, and medication instructions.

## 4. Functional Requirements

### 4.1 Patient Identification & Clinical Entry
* **Search/Entry:** The system must allow the user to select an existing patient via a search-as-you-type dropdown or create a new patient profile.
* **Chief Complaint:** A text field to capture the primary reason for the patient's visit (e.g., "Acute toothache," "Periodic check-up").
* **Treatment Records:** A multi-select or dynamic list where the user can enter treatments performed (e.g., "Root Canal Therapy," "Scaling," "Extraction"). Each treatment should have an associated "Cost" field that auto-populates the billing total.

### 4.2 Advanced Prescription Engine
This module must capture medication details with high granularity to ensure patient safety and clarity.

* **Medication Search:** A searchable database of available medicines.
* **Dosage Frequency (The "Standard" Format):**
    * The system must use a numeric shorthand (Morning-Afternoon-Night).
    * *Example:* 1-0-1 (Morning and Night), 1-1-1 (Thrice daily), 0-0-1 (Night only).
* **Timing Instructions:** A toggle or dropdown for:
    * **Before Food (AC - Ante Cibum)**
    * **After Food (PC - Post Cibum)**
* **Duration:** A field to specify the number of days the medication should be taken.
* **Dynamic List:** Users should be able to add multiple medicines to a single visit record.

### 4.3 POS & Billing Integration
* **Automated Calculation:** The system must sum the costs of all treatments entered in section 4.1.
* **Taxes & Discounts:** Fields for applying percentage-based or flat-rate discounts and applicable taxes.
* **Payment Methods:** Selection for Cash, Card, or Digital/UPI payments.
* **Print Generation:** The system must generate a PDF that combines the clinical summary, prescription, and the bill/receipt on one or two pages.

## 5. Technical Specifications

### 5.1 Data Schema (Conceptual)
* **Table: Visit_Records**
    * `visit_id` (PK)
    * `patient_id` (FK)
    * `chief_complaint` (Text)
    * `total_amount` (Decimal)
* **Table: Treatments_Applied**
    * `treatment_id` (FK)
    * `visit_id` (FK)
    * `cost_at_time_of_visit` (Decimal)
* **Table: Prescriptions**
    * `medication_name` (String)
    * `dosage_pattern` (e.g., "1-0-1")
    * `timing` (Enum: "Before Food", "After Food")
    * `duration` (Integer)

### 5.2 Local-First Architecture
* The module should support offline data entry with local SQLite storage to ensure no latency during patient checkout.
* State management should ensure that adding/removing medications updates the billing UI in real-time.

## 6. User Interface (UI) Requirements
* **Workflow Flow:** Patient Selection → Clinical Details → Medication Entry → Payment Summary.
* **Prescription Table:** A clean grid view showing:
    | Medicine | Dosage (M-A-N) | Instruction | Duration |
    | :--- | :--- | :--- | :--- |
    | Amoxicillin | 1-0-1 | After Food | 5 Days |
* **Quick-Add Buttons:** Preset buttons for common dosage patterns (1-0-1, 1-1-1) to reduce typing.

## 7. Success Metrics
* **Reduced Turnaround Time:** Average time to generate a bill and prescription should be under 120 seconds.
* **Accuracy:** Zero discrepancies between prescribed treatments and billed items.