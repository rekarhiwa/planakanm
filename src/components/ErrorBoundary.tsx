import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Text, View } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crash:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
            backgroundColor: '#0A0A0A',
          }}
        >
          <Text style={{ color: '#EF5350', fontSize: 18, marginBottom: 12, textAlign: 'center' }}>
            هەڵەیەک ڕوویدا
          </Text>
          <Text style={{ color: '#F5F0E6', textAlign: 'center', marginBottom: 8 }}>
            {this.state.error.message}
          </Text>
          <Text style={{ color: '#A89878', textAlign: 'center', fontSize: 12 }} selectable>
            {this.state.error.name}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
