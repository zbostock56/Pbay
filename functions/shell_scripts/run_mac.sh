lsof -i tcp:3000 | grep "^[0-9][0-9][0-9][0-9][0-9]*$"
if [ -z "$(lsof -i tcp:3000)" ]
then
      echo "*********** Output IS empty **************"
      cd ../functions/
      pwd
      npm run devStart
else
      echo "!!!!!!!!!!!!! Output is NOT empty !!!!!!!!!!"
      echo "The output was:"
      lsof -i tcp:3000
      echo "Killing the processes..."
      echo "--------------------------------------------"
      echo ""
      kill -9 $(lsof -i tcp:3000) | $(grep "^[0-9][0-9][0-9][0-9][0-9]*$")
      cd ../functions/
      pwd
      npm run devStart
fi