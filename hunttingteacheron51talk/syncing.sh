echo -n "输入提交介绍，默认为‘auto commit’ ->"
read msg
 
git pull
git add *
git commit -m $msg 
git push -u origin master

pause