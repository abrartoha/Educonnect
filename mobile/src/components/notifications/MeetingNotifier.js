import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthContext';
import { getSocket } from '../../lib/socket';

// Listens to the user's personal socket room for meeting:started events and
// surfaces a native Alert with "Join now". Mounted inside the navigator so it
// can navigate. Renders nothing.
export default function MeetingNotifier() {
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let socket;
    let detached = false;

    const handler = ({ bookingId, startedBy, mode, subject }) => {
      // Server emits to the starter too; ignore self.
      if (startedBy?.id === user?.id) return;
      const callType = mode === 'phone' ? 'call' : 'meeting';
      Alert.alert(
        `${startedBy?.name || 'Someone'} started the ${callType}`,
        subject || 'Meeting is ready to join.',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Join now',
            onPress: () =>
              navigation.navigate('Profile', {
                screen: 'Meeting',
                params: { bookingId, mode },
              }),
          },
        ]
      );
    };

    (async () => {
      socket = await getSocket();
      if (!socket || detached) return;
      socket.on('meeting:started', handler);
    })();

    return () => {
      detached = true;
      if (socket) socket.off('meeting:started', handler);
    };
  }, [isAuthenticated, user?.id, navigation]);

  return null;
}
