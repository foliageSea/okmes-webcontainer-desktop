#!/bin/bash

# 定义分支名称
BRANCH_NAME="main"

# 推送到第一个远程仓库
git push origin $BRANCH_NAME

# 检查第一个推送是否成功
if [ $? -ne 0 ]; then
    echo "Failed to push to origin"
    exit 1
fi

# 推送到第二个远程仓库
git push -u backup $BRANCH_NAME

# 检查第二个推送是否成功
if [ $? -ne 0 ]; then
    echo "Failed to push to backup"
    exit 1
fi

echo "Successfully pushed to both origin and backup"
