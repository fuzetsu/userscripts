echo -n "输入提交介绍，默认为‘auto commit’ ->"
read msg
 if [ -z "$msg" ]; then
     echo "committing as comment 'auto commit'"
	 msg="auto commit"
 fi
git pull
git add *
git commit -m $msg 
git push -u origin master

pause