/*
 * @Description: 滚动条
 * @Author: wangck
 * @Date: 2021-04-12 14:41:28
 * @LastEditors: g05047
 * @LastEditTime: 2021-05-13 15:06:30
 */

import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import classnames from 'classnames'
import styles from './index.module.less'
import { isIE, isEdge } from '../../../utils/checkIE'
import { debounce } from '../../../utils/dom'
function ScrollBox({
                     scrollBarTop = 0, // 距离顶部距离
                     scrollBarBot = 0, // 距离底部距离
                     realScrollBarWidth = 0, // 真实scrollbar 宽度
                     scrollBarWidth = 6,              // 滚动条宽度
                     scrollWrapColor = "white",// 滚动条容器背景颜色
                     scrollBarColor = "rgb(193,193,193)",// 滚动条颜色
                     scrollBarOpacity = '.6',// 滚动条透明度
                     maxHeight = 0,
                     scrollDistance = 0,
                     conflictArr,
                     children
                   }) {
  const [realScrollBarW, setRealScrollBarW] = useState(realScrollBarWidth),// 真实的滚动条宽度
      [scrollBarW, setScrollBarW] = useState(scrollBarWidth), // 自己伪造的滚动条的宽度
      [realScrollBarTop, setRealScrollBarTop] = useState(scrollBarTop), // 滚动条顶部top->顶部距离
      [realScrollBarBot, setRealScrollBarBot] = useState(scrollBarBot), // 滚动条顶部bottom->顶部距离
      [wrapH] = useState(maxHeight), //传入子元素的最大高度
      [contentHeight, setContentHeight] = useState(0),  //滚动内容的高度
      [scrollHeight] = useState(0),  // 需要滚动的高度
      [mouseDown, setMouseDown] = useState(false), // 鼠标按下标识
      [startPos, setStartPos] = useState(0), // 滚动条开始移动位置标识
      [changePos, setChangePos] = useState(0), // 滚动条改变的位置
      [firstEnter, setFirstEnter] = useState(false), // 是否第一次进入
      [wrapHeight, setWrapHeight] = useState(0)
  const wrapHRef = useRef(wrapH)
  wrapHRef.current = wrapH
  const scrollContentWrap = useRef() // 外部框dom元素
  const scrollContent = useRef() // 内部包裹dom元素
  const mouseDownRef = useRef(mouseDown) // 鼠标按下dom元素
  mouseDownRef.current = mouseDown;
  const changePosRef = useRef(changePos)
  changePosRef.current = changePos // 实时获取改变的位置
  const contentHeightRef = useRef(contentHeight)
  contentHeightRef.current = contentHeight // 实时获取内容的高度
  const startPosRef = useRef(startPos)
  startPosRef.current = startPos // 实时获取开始移动的位置
  useLayoutEffect(() => {
    // 滚动条的宽度
    if (isIE() || isEdge()) {
      setRealScrollBarW(scrollContentWrap.current.offsetWidth - scrollContentWrap.current.clientWidth)
    } else {
      setRealScrollBarW(() => { return scrollBarWidth })
    }
    // 第一次进来设置固定滚动位置
    // if (firstEnter) {
    //     scrollBarStateChange()
    // } else {
    //     setFirstEnter(true)
    //     // 第一次进来定位位置
    //     scrollContentWrap.current.scrollTop = scrollDistance
    scrollBarStateChange()
    // }
  }, [realScrollBarTop, children]);
  useLayoutEffect(() => {
    // 处理请求数据dom渲染滞后
    scrollBarStateChange()
  }, [conflictArr]);
  useLayoutEffect(() => {
    if (scrollDistance > 0) {
      scrollContentWrap.current.scrollTop = scrollDistance
    }
  }, [scrollDistance])
  const debounceResize = debounce(resizeFunc)
  useLayoutEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    // 监听全局屏幕大小事件
    window.addEventListener('resize', debounceResize)
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", debounceResize)
    };
  }, []);

  let scrollBar = "";
  scrollBar = (
      <div className={classnames(styles["scrollBarWrap"])}
           style={{
             width: scrollBarW + "px",
             borderRadius: scrollBarW / 2 + "px",
             opacity: scrollBarOpacity,
             backgroundColor: scrollWrapColor,
           }}>
        <div
            className={classnames(styles["scrollBar"])}
            style={{
              top: realScrollBarTop + "%",
              bottom: realScrollBarBot + "%",
              backgroundColor: scrollBarColor,
            }}
            onMouseDown={(e) => { handleMouseDown(e) }}
        >
        </div>
      </div>
  );
  return (
      <div className={classnames(styles["scrollBoxWrap"])}
           style={{ 'height': wrapHeight > 0 ? wrapHeight : '' }}
      >
        {scrollBar}
        <div
            className={classnames(styles["scrollContentWrap"])}
            ref={scrollContentWrap}
            onScroll={handleScroll}
            style={{
              right: "-" + realScrollBarW + "px",
            }}
        >
          <div
              className={classnames(styles["scrollContent"])}
              ref={scrollContent}
          >
            {children}
          </div>
        </div>
      </div >
  )
  /**
   * @description: 窗口放大缩小做相应操作
   * @param {*}
   * @return {*}
   */
  function resizeFunc() {
    scrollBarStateChange()
  }
  /**
   * @description: 滚动条滚动
   * @param {*}
   * @return {*}
   */
  function handleScroll() {
    let realScrollBarTop = (scrollContentWrap.current.scrollTop / contentHeight * 100);
    let realScrollBarBot = 100 - (parseFloat(scrollHeight) + parseFloat(realScrollBarTop));
    setRealScrollBarTop(realScrollBarTop.toFixed(2))
    setRealScrollBarBot(realScrollBarBot.toFixed(2))
  }
  /**
   * @description: 鼠标按住
   * @param {*} e
   * @return {*}
   */
  function handleMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    e.persist()
    setMouseDown(() => { return true })
    setStartPos(() => { return e.clientY })
  }
  /**
   * @description: 鼠标移动
   * @param {*} e
   * @return {*}
   */
  function handleMouseMove(e) {
    if (!mouseDownRef.current) return;
    setChangePos(() => { return (startPosRef.current - e.clientY) })
    setStartPos(() => { return e.clientY })
    scrollContentWrap.current.scrollTop -= changePosRef.current * contentHeightRef.current / scrollContentWrap.current.clientHeight
  }
  /**
   * @description: 鼠标抬起
   * @param {*}
   * @return {*}
   */
  function handleMouseUp(e) {
    setMouseDown(() => { return false })
  }
  /**
   * @description: scrollBar状态改变时触发
   * @param {*}
   * @return {*}
   */
  function scrollBarStateChange() {
    //需要动态设置滚动条宽度
    let tempH
    if (wrapH > 0) {
      tempH = wrapH
    } else {
      tempH = scrollContentWrap.current?.clientHeight
    }
    if (scrollContent.current?.clientHeight <= tempH) {
      setScrollBarW(0)
    } else {
      setScrollBarW(scrollBarWidth)
    }
    if (scrollContent.current?.clientHeight >= wrapH) {
      setWrapHeight(wrapH)
    } else {
      if (scrollContent.current?.clientHeight == 0) {
        setTimeout(() => {
          scrollBarStateChange()
        }, 300)
      }
      setWrapHeight(scrollContent.current?.clientHeight)
    }
    // 如果滚动内容的高度小于容器的高度则返回
    if (scrollContent.current?.clientHeight <= tempH) {
      return;
    }
    // 滚动内容高度
    setContentHeight(() => { return scrollContent.current?.clientHeight })
    // 需要滚动的高度
    // setScrollHeight(() => { return (wrapHRef.current / scrollContent.current.clientHeight * 100).toFixed(2) })
    let scrollHeight2 = (tempH / scrollContent.current?.clientHeight * 100).toFixed(2);
    let scrollTop = (scrollContentWrap.current?.scrollTop / scrollContent.current?.clientHeight * 100).toFixed(2);
    let realScrollBarTop = parseFloat(scrollTop);
    let realScrollBarBot = 100 - (parseFloat(scrollHeight2) + parseFloat(scrollTop));
    setRealScrollBarTop(realScrollBarTop)
    setRealScrollBarBot(realScrollBarBot)
  }
}
export default ScrollBox;
