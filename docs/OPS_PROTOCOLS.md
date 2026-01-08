# OPS PROTOCOLS

SCOPE: GLOBAL
UPDATE POLICY: RARE / EXPLICIT

---

## INDEX_UPDATE

TRIGGER:
After any task work (success, fail, or block).

STEPS (MANDATORY, ORDERED):

1. ENSURE REPORT
   - If no report file exists → create it.

2. WRITE / UPDATE REPORT
   - Use report template only.

3. UPDATE CORE POINTERS
   - NEU.md or ALT.md:
     - task spec ref
     - latest report ref

4. UPDATE ARCHIVE
   - Add task pointer under TASKS WORKED.

5. UPDATE CORTEX (OPTIONAL)
   - Set next Active Challenge if selected.

FAIL CONDITION:
Skipping any step → INVALID OUTPUT.

---

END OF DOCUMENT
