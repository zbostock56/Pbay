lsof -i tcp:3000 | grep "^[0-9][0-9][0-9][0-9][0-9]*$"
if [ -z "$(lsof -i tcp:3000)" ]
then
      echo "*********** \$OUTPUT is empty **************"
      cd ../functions/
      pwd
      npm run devStart
else
      echo "*********** \$OUTPUT is NOT empty ***********"
      echo "The output was:\n$OUTPUT"
      echo "Killing the processes..."
      kill -9 $(lsof -i tcp:3000) | $(grep "^[0-9][0-9][0-9][0-9][0-9]*$")
      cd ../functions/
      pwd
      npm run devStart
fi