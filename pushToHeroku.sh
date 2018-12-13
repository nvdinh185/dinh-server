#git init
git add .
git commit -am "push to heroku"
#heroku git:remote -a dinh-form-user
git push heroku master #--force
#heroku open