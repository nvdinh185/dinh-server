#git init
git add .
git commit -am "push to heroku"
#heroku git:remote -a dinh-server
git push heroku master #--force
#heroku open