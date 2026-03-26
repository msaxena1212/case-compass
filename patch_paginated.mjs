import fs from 'fs';
import path from 'path';

const searchDir = 'e:/Port/Legal Management/case-compass/src';

const paginatedFunctions = [
  'caseService.getAllCases',
  'clientService.getAllClients',
  'billingService.getAllInvoices',
  'billingService.getTimeEntries',
  'courtService.getAllHearings',
  'documentService.getAllDocuments'
];

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walk(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walk(searchDir, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    paginatedFunctions.forEach(fn => {
      // Look for const { data: varName = [] ... } = useQuery({ ... queryFn: fn ... })
      // This is a bit complex, let's just use matching on the file if it contains the fn.
      if (content.includes(fn)) {
         // Find lines with `const { data: SOMETHING = []`
         const lines = content.split('\n');
         let inQuery = false;
         let queryStartLine = -1;
         let dataVarName = '';

         for (let i = 0; i < lines.length; i++) {
           let line = lines[i];
           
           // Match `const { data: clients = [], ... } = useQuery`
           const match = line.match(/const\s*\{\s*data\s*:\s*([^=\s]+)\s*=\s*\[\]/);
           if (match && line.includes('useQuery')) {
             dataVarName = match[1];
             inQuery = true;
             queryStartLine = i;
           }

           if (inQuery && line.includes('queryFn:') && line.includes(fn)) {
             // We found a match! Fix the declaration.
             lines[queryStartLine] = lines[queryStartLine].replace(`data: ${dataVarName} = []`, `data: ${dataVarName}Response`);
             
             // Find end of useQuery
             let j = i;
             while (j < lines.length && !lines[j].includes('});') && !lines[j].includes(') {') && !lines[j].includes('})')) {
               j++;
             }
             if (lines[j] && (lines[j].includes('});') || lines[j].includes('})'))) {
               // insert assignment after hook
               lines.splice(j + 1, 0, `  const ${dataVarName} = ${dataVarName}Response?.data || [];`);
               inQuery = false;
               i = j+1; // skip the inserted line
             }
           } else if (inQuery && line.includes('})')) {
             inQuery = false; // end of query block
           }
         }
         content = lines.join('\n');
         
         // Fix one-liners
         // Example: const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: clientService.getAllClients });
         const oneLinerRegex = new RegExp(`const\\s*\\{\\s*data\\s*:\\s*([^=\\s]+)\\s*=\\s*\\[\\]([^\\}]*)\\}\\s*=\\s*useQuery\\(\\{\\s*(.*?queryFn\\s*:\\s*${fn.replace('.', '\\.')}.*?)\\}\\);`, 'g');
         content = content.replace(oneLinerRegex, (match, varName, rest, innerObj) => {
             return `const { data: ${varName}Response${rest}} = useQuery({ ${innerObj} });\n  const ${varName} = ${varName}Response?.data || [];`;
         });
      }
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed paginated mapping in', filePath);
    }
  }
});
