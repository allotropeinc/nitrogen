mkdir backend/app-temp
ng build --prod --aot --output-path backend/app-temp/
rm -rf backend/app
mv backend/app-temp backend/app
