echo "clean cache..."
rm -rf build/temp/
rm -rf build/targets/

echo ""

echo "install libs..."
npm install
bower install

echo ""

echo "running..."
grunt
