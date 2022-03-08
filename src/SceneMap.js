import * as React from 'react';

class SceneComponent extends React.PureComponent {
  render() {
    const { component, ...rest } = this.props;
    return React.createElement(component, rest);
  }
}

export default function SceneMap(scenes) {
  return ({ route, jumpTo, position }) => (
    <SceneComponent
      key={route.key}
      component={scenes[route.key]}
      route={route}
      jumpTo={jumpTo}
      position={position}
    />
  );
}
