# 🦷 Product Requirements Document (PRD)
## Dental POS Billing System (Advanced Version)

---

# 1. 📌 Product Overview

**Product Name:** DentiPOS (Working Name)

**Product Type:**  
Offline-first Dental POS Billing Software

**Platform:**  
Electron Desktop Application (Node.js + BetterSQLite)

**Theme Requirement:**  
- Light Mode & Dark Mode support
- Persistent theme preference
- Smooth UI transition

---

# 2. 🎯 Objective

To build a **flexible, high-speed POS billing system** for dental clinics that:

- Enables **quick billing with editable pricing**
- Supports **discounts and dynamic item creation**
- Tracks all financial transactions
- Generates POS receipts instantly
- Operates independently from EMR systems

---

# 3. 👥 Target Users

- Receptionist (Primary)
- Dentist (Optional interaction)
- Clinic Admin/Owner

---

# 4. 🔁 Functional Workflow

---

## Step 1: Patient Entry & Billing Initialization

**Inputs (Optional):**
- Patient Name
- Phone Number

**Actions:**
- Select:
  - Consultation
  - Treatment
  - Custom Billing Item

**System Behavior:**
- Create Transaction
- Assign Transaction ID
- Timestamp recorded

---

## Step 2: Billing Item Selection & Customization

**Actions:**
- Add items:
  - Consultation (predefined)
  - Treatment (from list)
  - Medicines
  - Custom Item (manual entry)

---

### 🔥 NEW CAPABILITIES

#### 1. Editable Pricing
- User can override price during billing
- Requires optional admin permission toggle

#### 2. Add Custom Items
- User can create ad-hoc billing items:
  - Name
  - Price
  - Category

#### 3. Save as Template (Optional)
- Custom item can be saved into master list

---

## Step 3: Discount Application

**Discount Types Supported:**
- Flat Discount (₹ amount)
- Percentage Discount (%)

**Rules:**
- Applied on total bill
- Optional per-item discount (future scope)

**System Behavior:**
- Auto recalculates total
- Displays:
  - Subtotal
  - Discount
  - Final Amount

---

## Step 4: Doctor Consultation (External)

- No mandatory system interaction
- Optional notes field

---

## Step 5: Pharmacy Billing (Optional)

**Actions:**
- Add medicines
- Quantity-based calculation
- Merge or separate billing

---

## Step 6: Payment Processing

**Payment Modes:**
- Cash
- UPI
- Card

**System Behavior:**
- Record payment
- Validate total vs paid amount
- Mark transaction as completed

---

## Step 7: Receipt Generation

**Receipt Content:**
- Clinic details
- Transaction ID
- Itemized bill
- Discount applied
- Final amount
- Payment mode
- GST (if enabled)

**Actions:**
- Print receipt
- Reprint option

---

# 5. 🧱 Core Modules

---

## 5.1 Quick Billing Module
- Fast item selection
- Editable pricing
- Add custom billing items

---

## 5.2 Discount Engine
- Flat & percentage discounts
- Real-time calculation
- UI display of breakdown

---

## 5.3 Dynamic Catalog Module

**Features:**
- Add/Edit/Delete:
  - Treatments
  - Medicines
- Save custom items
- Admin-only access

---

## 5.4 Payment Module
- Multi-mode payment support
- Transaction validation

---

## 5.5 Receipt Module
- POS printer integration
- Discount-aware receipt format

---

## 5.6 Reports Module
- Revenue summary
- Discount tracking
- Category-wise earnings

---

## 5.7 Admin Settings Module
- Pricing control
- GST toggle
- Discount permissions
- Clinic info

---

# 6. 🗄️ Database Schema

---

## Table: Transactions
- id
- timestamp
- total_amount
- discount_amount
- final_amount

---

## Table: Transaction_Items
- id
- transaction_id
- item_name
- category
- quantity
- unit_price
- total_price

---

## Table: Payments
- id
- transaction_id
- payment_mode
- amount

---

## Table: Discounts
- id
- transaction_id
- type (flat / percentage)
- value

---

## Table: Treatment_Master
- id
- name
- price

---

## Table: Medicine_Master
- id
- name
- price

---

## Table: Settings
- consultation_fee
- gst_enabled
- allow_price_override
- allow_discount
- clinic_name
- clinic_address

---

# 7. 🎨 UI/UX Requirements

---

## Design Principles
- Minimal clicks (≤2–3 steps)
- Fast responsiveness
- Large touch-friendly UI

---

## Theme System

### Light Mode
- Background: #FFFFFF / #F5F5F5
- Text: #111111

### Dark Mode
- Background: #121212
- Text: #FFFFFF

---

## Theme Features
- Toggle switch in header
- Persist using local storage
- No UI flicker on toggle

---

## Key Screens

---

### 1. Billing Screen
- Item selection panel
- Cart view
- Price edit option
- Discount input
- Total display

---

### 2. Payment Modal
- Payment mode selection
- Final confirmation

---

### 3. Reports Dashboard
- Revenue cards
- Discount analytics

---

### 4. Admin Panel
- Manage treatments
- Manage medicines
- Toggle permissions

---

# 8. ⚙️ Technical Requirements

- Electron + React UI
- IPC-based backend
- BetterSQLite database
- Thermal printer integration

---

# 9. 🔐 Non-Functional Requirements

- Offline-first
- Fast (<1 sec operations)
- Reliable data storage
- Backup & restore support

---

# 10. 🧪 UAT (User Acceptance Testing)

---

## 🎯 Objective

Ensure system meets real-world clinic billing requirements with accuracy, speed, and reliability.

---

## 🔹 UAT Scenarios

---

### ✅ Scenario 1: Basic Consultation Billing

**Steps:**
1. Click Consultation
2. Generate bill
3. Complete payment

**Expected Result:**
- Receipt printed
- Transaction stored correctly

---

### ✅ Scenario 2: Editable Price Override

**Steps:**
1. Add treatment
2. Modify price manually
3. Complete billing

**Expected Result:**
- Updated price reflected
- Stored correctly in DB

---

### ✅ Scenario 3: Apply Flat Discount

**Steps:**
1. Add items
2. Apply ₹ discount
3. Complete payment

**Expected Result:**
- Final amount correct
- Discount shown in receipt

---

### ✅ Scenario 4: Apply Percentage Discount

**Steps:**
1. Add items
2. Apply % discount
3. Complete billing

**Expected Result:**
- Accurate calculation
- No rounding errors

---

### ✅ Scenario 5: Add Custom Billing Item

**Steps:**
1. Add custom item
2. Enter name + price
3. Complete transaction

**Expected Result:**
- Item appears in bill
- Stored correctly

---

### ✅ Scenario 6: Pharmacy Billing

**Steps:**
1. Add medicine
2. Enter quantity
3. Generate bill

**Expected Result:**
- Correct multiplication
- Accurate total

---

### ✅ Scenario 7: Multi Payment Modes

**Steps:**
1. Select UPI/Card/Cash
2. Complete payment

**Expected Result:**
- Correct payment recorded

---

### ✅ Scenario 8: Receipt Reprint

**Steps:**
1. Open past transaction
2. Click reprint

**Expected Result:**
- Identical receipt printed

---

### ✅ Scenario 9: Theme Switching

**Steps:**
1. Toggle light/dark mode

**Expected Result:**
- UI updates instantly
- No layout break

---

### ✅ Scenario 10: Reports Accuracy

**Steps:**
1. Perform multiple transactions
2. Open reports

**Expected Result:**
- Totals match transaction data

---

# 11. ✅ Acceptance Criteria

- Billing completes in ≤2 clicks
- Discounts apply correctly
- Price editing works reliably
- Custom items supported
- Receipts print accurately
- Reports match database
- Theme toggle stable

---

# END OF PRD