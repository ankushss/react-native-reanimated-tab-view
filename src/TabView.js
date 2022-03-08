import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import SceneView from './SceneView';
import Pager from './Pager';

export default function TabView({
  onIndexChange,
  navigationState,
  renderScene,
  initialLayout,
  keyboardDismissMode = 'auto',
  lazy = false,
  lazyPreloadDistance = 0,
  onSwipeStart,
  onSwipeEnd,
  renderLazyPlaceholder = () => null,
  renderTabBar,
  sceneContainerStyle,
  style,
  swipeEnabled = true,
}) {
  const [layout, setLayout] = React.useState({
    width: 0,
    height: 0,
    ...initialLayout,
  });

  const jumpToIndex = (index) => {
    if (index !== navigationState.index) {
      onIndexChange(index);
    }
  };

  const handleLayout = (e) => {
    const { height, width } = e.nativeEvent.layout;

    setLayout((prevLayout) => {
      if (prevLayout.width === width && prevLayout.height === height) {
        return prevLayout;
      }

      return { height, width };
    });
  };

  return (
    <View onLayout={handleLayout} style={[styles.pager, style]}>
      <Pager
        layout={layout}
        navigationState={navigationState}
        keyboardDismissMode={keyboardDismissMode}
        swipeEnabled={swipeEnabled}
        onSwipeStart={onSwipeStart}
        onSwipeEnd={onSwipeEnd}
        onIndexChange={jumpToIndex}
      >
        {({ position, offset, render, addEnterListener, jumpTo }) => {
          // All of the props here must not change between re-renders
          // This is crucial to optimizing the routes with PureComponent
          const sceneRendererProps = {
            layout,
            jumpTo,
          };

          return (
            <React.Fragment>
              {renderTabBar({
                position,
                offset,
                ...sceneRendererProps,
                navigationState,
              })}
              {render(
                navigationState.routes.map((route, i) => {
                  return (
                    <SceneView
                      {...sceneRendererProps}
                      addEnterListener={addEnterListener}
                      key={route.key}
                      index={i}
                      lazy={typeof lazy === 'function' ? lazy({ route }) : lazy}
                      lazyPreloadDistance={lazyPreloadDistance}
                      navigationState={navigationState}
                      style={sceneContainerStyle}
                    >
                      {({ loading }) =>
                        loading
                          ? renderLazyPlaceholder({ route })
                          : renderScene({
                              ...sceneRendererProps,
                              route,
                            })
                      }
                    </SceneView>
                  );
                })
              )}
            </React.Fragment>
          );
        }}
      </Pager>
    </View>
  );
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
    overflow: 'hidden',
  },
});
