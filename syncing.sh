echo -n "输入提交介绍，默认为‘auto commit’ ->"
read msg
 if [ -z "$msg" ]; then
     echo "committing as comment 'Just auto-commit for synchronizing workspace'"
	 msg="Just auto-commit for synchronizing workspace"
 fi
git pull
git add *
git commit -m "$msg"
git push -u origin master

pause
