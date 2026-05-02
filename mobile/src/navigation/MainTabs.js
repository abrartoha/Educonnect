import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import Icon from '../components/Icon';

import FeedScreen from '../screens/feed/FeedScreen';
import PostDetailScreen from '../screens/feed/PostDetailScreen';

import DirectoryListScreen from '../screens/marketplace/DirectoryListScreen';
import DirectoryDetailScreen from '../screens/marketplace/DirectoryDetailScreen';
import CompareScreen from '../screens/marketplace/CompareScreen';

import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

import CreatePostScreen from '../screens/posts/CreatePostScreen';
import MyPostsScreen from '../screens/posts/MyPostsScreen';
import BookmarksScreen from '../screens/posts/BookmarksScreen';

import BookingsScreen from '../screens/business/BookingsScreen';
import CreateBookingScreen from '../screens/business/CreateBookingScreen';
import LeadsScreen from '../screens/business/LeadsScreen';
import CampaignsScreen from '../screens/business/CampaignsScreen';

import RoleDashboardScreen from '../screens/dashboard/RoleDashboardScreen';

import AdminOverviewScreen from '../screens/admin/AdminOverviewScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminPostsScreen from '../screens/admin/AdminPostsScreen';

import MessagesListScreen from '../screens/messages/MessagesListScreen';
import ConversationScreen from '../screens/messages/ConversationScreen';

// Lazy wrapper — defers the @livekit/react-native import so Expo Go boots fine.
import MeetingScreen from '../screens/meeting/MeetingScreenLazy';

import MeetingNotifier from '../components/notifications/MeetingNotifier';

import { colors } from '../theme';

const Tab = createBottomTabNavigator();

// ---- Feed stack ----------------------------------------------------------
const FeedStackNav = createNativeStackNavigator();
function FeedStack() {
  return (
    <FeedStackNav.Navigator screenOptions={{ headerShown: false }}>
      <FeedStackNav.Screen name="FeedHome" component={FeedScreen} />
      <FeedStackNav.Screen name="PostDetail" component={PostDetailScreen} />
      <FeedStackNav.Screen name="CreatePost" component={CreatePostScreen} />
    </FeedStackNav.Navigator>
  );
}

// ---- Marketplace stacks --------------------------------------------------
function makeDirectoryStack(type, listName, detailName) {
  const Stack = createNativeStackNavigator();
  const Wrap = () => (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={listName}
    >
      <Stack.Screen
        name={listName}
        component={DirectoryListScreen}
        initialParams={{ type }}
      />
      <Stack.Screen
        name={detailName}
        component={DirectoryDetailScreen}
        initialParams={{ type }}
      />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="CreateBooking" component={CreateBookingScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      <Stack.Screen
        name="Meeting"
        component={MeetingScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      {/* Compare lives on the Universities stack but is only opened there. */}
      {type === 'university' ? (
        <Stack.Screen name="Compare" component={CompareScreen} />
      ) : null}
    </Stack.Navigator>
  );
  Wrap.displayName = `${type}Stack`;
  return Wrap;
}

const UniversitiesStack = makeDirectoryStack('university', 'UniList', 'UniversityDetail');
const AgentsStack = makeDirectoryStack('agent', 'AgentList', 'AgentDetail');
const ConsultantsStack = makeDirectoryStack('consultant', 'ConsultantList', 'ConsultantDetail');

// ---- Profile stack with all the role-specific screens --------------------
const ProfileStackNav = createNativeStackNavigator();
function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStackNav.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStackNav.Screen name="RoleDashboard" component={RoleDashboardScreen} />

      <ProfileStackNav.Screen name="MyPosts" component={MyPostsScreen} />
      <ProfileStackNav.Screen name="Bookmarks" component={BookmarksScreen} />
      <ProfileStackNav.Screen name="CreatePost" component={CreatePostScreen} />
      <ProfileStackNav.Screen name="PostDetail" component={PostDetailScreen} />

      <ProfileStackNav.Screen name="Bookings" component={BookingsScreen} />
      <ProfileStackNav.Screen name="CreateBooking" component={CreateBookingScreen} />
      <ProfileStackNav.Screen name="Leads" component={LeadsScreen} />
      <ProfileStackNav.Screen name="Campaigns" component={CampaignsScreen} />

      <ProfileStackNav.Screen name="AdminOverview" component={AdminOverviewScreen} />
      <ProfileStackNav.Screen name="AdminUsers" component={AdminUsersScreen} />
      <ProfileStackNav.Screen name="AdminPosts" component={AdminPostsScreen} />

      <ProfileStackNav.Screen name="Conversation" component={ConversationScreen} />
      <ProfileStackNav.Screen
        name="Meeting"
        component={MeetingScreen}
        options={{ presentation: 'fullScreenModal' }}
      />

      <ProfileStackNav.Screen name="Compare" component={CompareScreen} />
    </ProfileStackNav.Navigator>
  );
}

// ---- Messages stack ------------------------------------------------------
const MessagesStackNav = createNativeStackNavigator();
function MessagesStack() {
  return (
    <MessagesStackNav.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStackNav.Screen name="MessagesList" component={MessagesListScreen} />
      <MessagesStackNav.Screen name="Conversation" component={ConversationScreen} />
    </MessagesStackNav.Navigator>
  );
}

// Lucide-based tab icon. Adds a small dot under the active tab for polish.
const TabIcon = ({ name, focused, color }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Icon name={name} size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
    {focused ? (
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: color,
          marginTop: 4,
        }}
      />
    ) : null}
  </View>
);

export default function MainTabs() {
  return (
    <>
    <MeetingNotifier />
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary600,
        tabBarInactiveTintColor: colors.slate500,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.white,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedStack}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="Newspaper" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Universities"
        component={UniversitiesStack}
        options={{
          tabBarLabel: 'Unis',
          tabBarIcon: ({ focused, color }) => <TabIcon name="Building2" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Agents"
        component={AgentsStack}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="Waves" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Consultants"
        component={ConsultantsStack}
        options={{
          tabBarLabel: 'Consult',
          tabBarIcon: ({ focused, color }) => <TabIcon name="Briefcase" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="MessageSquare" focused={focused} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="User" focused={focused} color={color} />,
        }}
      />
    </Tab.Navigator>
    </>
  );
}
