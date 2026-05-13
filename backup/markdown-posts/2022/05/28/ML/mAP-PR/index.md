---
title: "P，R，AP, mAP, AP@0.5, mAP@0.5:0.95"
date: "2022-05-28T05:48:30.000Z"
updated: "2023-07-29T06:34:15.702Z"
slug: "ML/mAP-PR"
permalink: "/2022/05/28/ML/mAP-PR/"
categories: ["技能-修行-进步-ML"]
tags: ["物体检测-metrics"]
---
reference IOU，Intersection of Union，两个框的交集/两个框的并集GT，Ground-truth，真实的标注TP，True Positive，检测结果是正确的，简称正检FP，False Positive，检测结果是错误的，简称误检FN，False Negative，没有检测到的目标，简称漏检P，Precison，精准率，检测结果中检测正确所占比例R，Recall，召回率，检测结果中正确检测个数占GT的比例======================================================================== AP，Average Precision，AP计算一个类别，一系列Precision点，Recall点组成一个P-R曲线图，P-R曲线图下的面积就是APmAP，mean Average Precision，多个AP求平均值======================================================================== &#x41;&#80;&#64;&#48;&#x2e;&#53;，计算一个类别的AP，0.5是IOU_thresh的阈值，用来过滤检测框和真实框之间的重叠度IOU，IOU>0.5满足条件&#65;&#80;&#x40;&#48;&#x2e;&#x35;:0.95，即[0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95] 10个IOU_thresh阈值来画出10个P-R曲线，然后求平均值&#109;&#x41;&#80;&#64;&#48;&#x2e;&#53;，计算多个类别（AP）在IOU_thresh=0.5的阈值的情况下的平均值&#x6d;&#65;&#80;&#x40;&#x30;&#x2e;&#x35;:0.95，计算多个类别（AP）在IOU_thresh=[0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95] 10个IOU_thresh阈值的情况下的平均值======================================================================== VOC2007，计算[0:0.1:1]11个recall-point下的Precision点和Recall点值，画P-R曲线，曲线下的面积就是APVOC2010，计算检测值按confidence降序排序，所有confidence都当成recall-point计算Precision点和Recall点值，画P-R曲线，曲线下的面积就是APCOCO，计算[0:0.01,1]101个recall-point下的Precision点和Recall点值，画P-R曲线，曲线下的面积就是AP========================================================================
