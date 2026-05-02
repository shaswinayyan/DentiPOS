# PDF Receipt Generation Test Cases

These test cases are designed to verify that the DentiPOS system correctly generates and saves receipt PDFs with actual content, formatted for an A4 size paper.

## Test Case 1: Validate PDF Generation with Single Item
**Objective:** Verify that saving a bill with a single item generates a non-empty PDF file.
**Pre-conditions:** The application is running.
**Steps:**
1. Navigate to the Billing tab.
2. Click on "Consultation Fee" to add it to the cart.
3. Click "Proceed to Payment".
4. Select "Cash" and click "Mark Paid".
5. On the receipt view, click "Print".
6. Save the generated PDF file (e.g., `single_item_bill.pdf`).
**Expected Results:**
- The system prompts to save a PDF file.
- The saved PDF file is NOT empty (file size should be > 2KB).
- Opening the PDF reveals a white background with black text showing the clinic name, transaction details, and "Consultation Fee".
- The width of the document is correctly formatted to match an A4 page.

## Test Case 2: Validate PDF Generation with Multiple Items and Discounts
**Objective:** Verify that a complex bill generates correctly and does not cut off content or render as a blank grey screen.
**Pre-conditions:** The application is running, and there are treatments and medicines in the catalog.
**Steps:**
1. Navigate to the Billing tab.
2. Add 2-3 different treatments and a medicine to the cart.
3. Change the quantity of one item to 3.
4. Add a "Flat" discount of ₹100.
5. Click "Proceed to Payment" and complete the payment.
6. On the receipt view, click "Print" and save the file (e.g., `multi_item_bill.pdf`).
**Expected Results:**
- The saved PDF contains all items, quantities, and correct subtotal/total calculations.
- The discount is explicitly shown.
- The background is pure white and the text is black.
- The layout is properly formatted for an A4 page width.

## Test Case 3: Verify Empty Page/Grey Background Fix
**Objective:** Verify that the layout CSS `display: none !important` issue no longer applies to the receipt area when printing.
**Steps:**
1. Open any generated PDF from the previous tests.
2. Ensure the background is strictly white, and not grey.
3. Ensure the text is visible and legible.
**Expected Results:**
- The PDF viewer displays a narrow, receipt-like document.
- The content is perfectly readable, proving that `#receipt-area` is properly visible to the Electron `printToPDF` engine.

## Scripted Verification (Optional)
If you want to verify that the PDF has actual text content via a script, you can install a package like `pdf-parse`:
```bash
npm install pdf-parse
```
And run a script to assert the text content:
```javascript
const fs = require('fs');
const pdf = require('pdf-parse');

async function testPdfHasContent(pdfPath) {
    let dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    if (data.text.trim().length === 0) {
        console.error("❌ FAILED: The PDF is empty!");
    } else {
        console.log("✅ PASSED: The PDF contains text:", data.text.substring(0, 50) + "...");
    }
}
testPdfHasContent('path/to/your/generated_bill.pdf');
```
