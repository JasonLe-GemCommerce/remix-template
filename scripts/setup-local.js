import * as path from 'path';
import * as fs from 'fs';

import dotenv from 'dotenv';

dotenv.config();

const PRISMA_PROVIDER = process.env.DATABASE_PROVIDER || 'postgresql';

// Function to copy a file
function copyFileSync(source, target) {
  const targetFile =
    fs.existsSync(target) && fs.lstatSync(target).isDirectory()
      ? path.join(target, path.basename(source))
      : target;
  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function init() {
  const sourceDir = './prisma';
  const destDir = './prisma_local';

  fs.rmSync(destDir, { recursive: true, force: true });
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const sourceFilePath = path.join(sourceDir, 'schema.prisma');
  const destFilePath = path.join(destDir, 'schema.prisma');

  copyFileSync(sourceFilePath, destFilePath);

  const fileContent = fs.readFileSync(destFilePath, 'utf-8');

  const updatedContent = fileContent.replace(/\bpostgresql\b/g, PRISMA_PROVIDER);

  fs.writeFileSync(destFilePath, updatedContent);

  console.log('File updated successfully.');
}
init();
