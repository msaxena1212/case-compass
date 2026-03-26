import fs from 'fs';
import path from 'path';

const searchDir = 'e:/Port/Legal Management/case-compass/src';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(searchDir, function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Pattern 1: { data: cases = [] } ... queryFn: caseService.getAllCases
    if (content.includes('queryFn: caseService.getAllCases')) {
      content = content.replace(
        /const\s*\{\s*data\s*:\s*cases\s*=\s*\[\]\s*\}\s*=\s*useQuery\(\{\s*queryKey\s*:\s*\['cases'([^]*?)queryFn\s*:\s*caseService\.getAllCases/,
        "const { data: casesResponse } = useQuery({\n    queryKey: ['cases'$1queryFn: () => caseService.getAllCases(1, 1000)"
      );
      content = content.replace(
        /const\s*\{\s*data\s*:\s*cases\s*=\s*\[\]\s*\}\s*=\s*useQuery\(\s*\{\s*queryKey\s*:\s*\['cases'\],\s*queryFn\s*:\s*caseService\.getAllCases\s*\}\s*\);/g,
        "const { data: casesResponse } = useQuery({ queryKey: ['cases'], queryFn: () => caseService.getAllCases(1, 1000) });\n  const cases = casesResponse?.data || [];"
      );
      
      // For multi-line ones that don't match the one-liner, we add cases = casesResponse?.data || [] after the hook
      if (content.includes('casesResponse') && !content.includes('const cases = casesResponse')) {
         // find the end of the useQuery hook
         const parts = content.split('casesResponse } = useQuery({');
         if (parts.length > 1) {
            let hookEndIdx = content.indexOf('});', content.indexOf('casesResponse } = useQuery({'));
            if (hookEndIdx > -1) {
               content = content.slice(0, hookEndIdx + 3) + '\n  const cases = casesResponse?.data || [];' + content.slice(hookEndIdx + 3);
            }
         }
      }
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed', filePath);
    }
  }
});
