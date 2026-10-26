import {cpSync,mkdirSync,rmSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true});mkdirSync('dist/preview-assets',{recursive:true});cpSync('index.html','dist/index.html');cpSync('index.html','dist/404.html');cpSync('preview-assets/editorial.css','dist/preview-assets/editorial.css');
