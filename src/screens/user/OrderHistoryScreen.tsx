import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

const OrderHistoryScreen = ({ navigation }) => {
  const { tasks } = useApp();
  const [filter, setFilter] = useState('all');
  const insets = useSafeAreaInsets();

  const mockTasks = tasks.length > 0 ? tasks : [
    {
      id: '1',
      type: 'send',
      pickup: '123 Makati Avenue, Makati City',
      dropoff: '456 Quezon Avenue, Quezon City',
      status: 'completed',
      price: 150,
      createdAt: '2024-01-15 14:30',
      courier: { name: 'Juan Dela Cruz' },
    },
    {
      id: '2',
      type: 'errand',
      pickup: '789 BGC, Taguig City',
      dropoff: '101 Ortigas, Pasig City',
      status: 'completed',
      price: 200,
      createdAt: '2024-01-14 10:15',
      courier: { name: 'Maria Santos' },
    },
    {
      id: '3',
      type: 'multistop',
      pickup: 'SM Mall of Asia',
      dropoff: 'Bonifacio High Street',
      status: 'cancelled',
      price: 180,
      createdAt: '2024-01-13 16:45',
      courier: { name: 'Pedro Reyes' },
    },
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredTasks = filter === 'all'
    ? mockTasks
    : mockTasks.filter(task => task.status === filter);

  const renderTaskItem = ({ item }) => (
    <Card
      style={styles.taskCard}
      onPress={() => navigation.navigate('LiveTracking', { task: item })}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskIcon}>
          <Ionicons
            name={
              item.type === 'send' ? 'cube-outline' :
              item.type === 'errand' ? 'cart-outline' :
              'navigate-outline'
            }
            size={24}
            color={COLORS.primary}
          />
        </View>
        <View style={styles.taskInfo}>
          <View style={styles.taskRow}>
            <Text style={styles.taskType}>
              {item.type === 'send' ? 'Send Item' :
               item.type === 'errand' ? 'Run Errand' :
               'Multi-stop Task'}
            </Text>
            <StatusBadge status={item.status} />
          </View>
          <Text style={styles.taskDate}>{item.createdAt}</Text>
        </View>
      </View>

      <View style={styles.taskDivider} />

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <View style={styles.locationDot}>
            <Ionicons name="ellipse" size={10} color={COLORS.primary} />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.pickup}
          </Text>
        </View>

        <View style={styles.dashedLine} />

        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={COLORS.error} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.dropoff}
          </Text>
        </View>
      </View>

      {item.courier && (
        <View style={styles.courierRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.textGray} />
          <Text style={styles.courierText}>{item.courier.name}</Text>
        </View>
      )}

      <View style={styles.taskFooter}>
        <Text style={styles.price}>₱{item.price}</Text>
        <View style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.filterChip,
              filter === f.id && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f.id)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.id && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredTasks.length > 0 ? (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 80 : 100 }
          ]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="file-tray-outline" size={64} color={COLORS.textLight} />
          </View>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your completed and cancelled orders will appear here
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.paddingLarge,
    paddingTop: 60,
    paddingBottom: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterContent: {
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.padding,
    gap: SIZES.marginSmall,
  },
  filterChip: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSmall,
    borderRadius: SIZES.radiusLarge,
    backgroundColor: COLORS.backgroundGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SIZES.paddingLarge,
  },
  taskCard: {
    marginBottom: SIZES.margin,
  },
  taskHeader: {
    flexDirection: 'row',
    gap: SIZES.margin,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
    gap: 4,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SIZES.marginSmall,
  },
  taskType: {
    flex: 1,
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  taskDate: {
    fontSize: SIZES.tiny,
    color: COLORS.textLight,
  },
  taskDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.margin,
  },
  locationContainer: {
    marginBottom: SIZES.marginSmall,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.marginSmall,
  },
  locationDot: {
    width: 14,
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.textDark,
  },
  dashedLine: {
    width: 1,
    height: 16,
    marginLeft: 7,
    marginVertical: 2,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    borderStyle: 'dashed',
  },
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SIZES.marginSmall,
    paddingTop: SIZES.marginSmall,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  courierText: {
    fontSize: SIZES.tiny,
    color: COLORS.textGray,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.margin,
  },
  price: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLarge * 2,
  },
  emptyIcon: {
    marginBottom: SIZES.marginLarge,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SIZES.marginSmall,
  },
  emptySubtitle: {
    fontSize: SIZES.body,
    color: COLORS.textGray,
    textAlign: 'center',
  },
});

export default OrderHistoryScreen;
