import * as React from "react";
import Animated, { useSharedValue } from "react-native-reanimated";
import { Keyboard, StyleSheet } from "react-native";
import ViewPager from "react-native-pager-view";

import { useAnimatedPagerScrollHandler } from "./useAnimatedPagerScrollHandler";

const AnimatedViewPager = Animated.createAnimatedComponent(ViewPager);

export default function PagerViewAdapter({
  keyboardDismissMode = "auto",
  swipeEnabled = true,
  navigationState,
  onIndexChange,
  onSwipeStart,
  onSwipeEnd,
  children,
  style,
  ...rest
}) {
  const { index } = navigationState;

  const listenersRef = React.useRef([]);

  const pagerRef = React.useRef();
  const indexRef = React.useRef(index);
  const navigationStateRef = React.useRef(navigationState);

  const position = useSharedValue(index);
  const offset = useSharedValue(0);

  React.useEffect(() => {
    navigationStateRef.current = navigationState;
  });

  const jumpTo = React.useCallback((key) => {
    const index = navigationStateRef.current.routes.findIndex(
      (route) => route.key === key
    );

    pagerRef.current?.setPage(index);
  }, []);

  React.useEffect(() => {
    if (keyboardDismissMode === "auto") {
      Keyboard.dismiss();
    }

    if (indexRef.current !== index) {
      pagerRef.current?.setPage(index);
    }
  }, [keyboardDismissMode, index]);

  const onPageScrollStateChanged = (state) => {
    const { pageScrollState } = state.nativeEvent;

    switch (pageScrollState) {
      case "idle":
        onSwipeEnd?.();
        return;
      case "dragging": {
        const next =
          index +
          (offset.value > 0
            ? Math.ceil(offset.value)
            : Math.floor(offset.value));

        if (next !== index) {
          listenersRef.current.forEach((listener) => listener(next));
        }

        onSwipeStart?.();
        return;
      }
    }
  };

  const addEnterListener = React.useCallback((listener) => {
    listenersRef.current.push(listener);

    return () => {
      const index = listenersRef.current.indexOf(listener);

      if (index > -1) {
        listenersRef.current.splice(index, 1);
      }
    };
  }, []);

  const scrollHandler = useAnimatedPagerScrollHandler(
    {
      onPageScroll: (e) => {
        "worklet";
        position.value = e.position;
        offset.value = e.offset;
      },
    },
    []
  );

  return children({
    position: position,
    offset: offset,
    addEnterListener,
    jumpTo,
    render: (children) => (
      <AnimatedViewPager
        {...rest}
        ref={pagerRef}
        style={[styles.container, style]}
        initialPage={index}
        keyboardDismissMode={
          keyboardDismissMode === "auto" ? "on-drag" : keyboardDismissMode
        }
        onPageScroll={scrollHandler}
        onPageSelected={(e) => {
          const index = e.nativeEvent.position;
          indexRef.current = index;
          onIndexChange(index);
        }}
        onPageScrollStateChanged={onPageScrollStateChanged}
        scrollEnabled={swipeEnabled}
      >
        {children}
      </AnimatedViewPager>
    ),
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
