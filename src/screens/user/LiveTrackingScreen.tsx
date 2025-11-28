import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { useApp } from '../../context/AppContext';

const LiveTrackingScreen = ({ navigation, route }) => {
  const { currentTask } = useApp();
  const [activeTab, setActiveTab] = useState('tracking');

  // Use task from route params or fallback to currentTask or default
  const task = route?.params?.task || currentTask || {
    id: '1',
    type: 'send',
    pickup: '123 Makati Avenue, Makati City',
    dropoff: '456 Quezon Avenue, Quezon City',
    status: 'in_transit',
    courier: {
      name: 'Juan Dela Cruz',
      rating: 4.8,
      vehicle: 'Motorcycle',
      plate: 'ABC 1234',
      phone: '+639171234567',
    },
    eta: '12 min',
    price: 150,
  };

  const statusSteps = [
    { status: 'searching', label: 'Searching for courier' },
    { status: 'accepted', label: 'Courier accepted' },
    { status: 'pickup', label: 'On the way to pickup' },
    { status: 'in_transit', label: 'Item picked up' },
    { status: 'completed', label: 'Delivered' },
  ];

  const currentStatusIndex = statusSteps.findIndex(
    item => item.status === task.status
  );

  const statusTimeline = statusSteps.map((step, index) => ({
    ...step,
    completed: index <= currentStatusIndex,
  }));

  const handleCall = () => {
    Linking.openURL(`tel:${task.courier.phone}`);
  };

  const handleChat = () => {
    // Navigate to chat screen
  };

  const handleCancel = () => {
    // Show cancel confirmation
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapContent}>
            {/* Pickup Location */}
            <View style={styles.locationCard}>
              <View style={styles.locationMarker}>
                <Ionicons name="ellipse" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>Pickup Location</Text>
                <Text style={styles.locationAddress} numberOfLines={2}>
                  {task.pickup}
                </Text>
              </View>
            </View>

            {/* Route Visualization */}
            <View style={styles.routeVisualization}>
              <View style={styles.routePath}>
                {/* Top segment */}
                <View style={styles.pathSegment} />

                {/* Courier position */}
                <View style={styles.courierMarker}>
                  <View style={styles.courierPulse} />
                  <View style={styles.courierIcon}>
                    <Ionicons name="bicycle" size={20} color={COLORS.white} />
                  </View>
                </View>

                {/* Bottom segment */}
                <View style={styles.pathSegment} />
              </View>
            </View>

            {/* Dropoff Location */}
            <View style={styles.locationCard}>
              <View style={[styles.locationMarker, styles.dropoffMarker]}>
                <Ionicons name="location" size={28} color={COLORS.error} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>Drop-off Location</Text>
                <Text style={styles.locationAddress} numberOfLines={2}>
                  {task.dropoff}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.etaBadge}>
          <Ionicons name="time-outline" size={16} color={COLORS.white} />
          <Text style={styles.etaText}>ETA: {task.eta || '15 min'}</Text>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tracking' && styles.tabActive]}
            onPress={() => setActiveTab('tracking')}
          >
            <Text style={[styles.tabText, activeTab === 'tracking' && styles.tabTextActive]}>
              Tracking
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.tabActive]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
              Details
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'tracking' ? (
            <>
              {task.courier && (
                <Card style={styles.courierCard}>
                  <View style={styles.courierHeader}>
                    <View style={styles.courierInfo}>
                      <View style={styles.courierAvatar}>
                        <Ionicons name="person" size={32} color={COLORS.white} />
                      </View>
                      <View style={styles.courierDetails}>
                        <Text style={styles.courierName}>{task.courier.name}</Text>
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={14} color="#f59e0b" />
                          <Text style={styles.rating}>{task.courier?.rating || '5.0'}</Text>
                          {task.courier?.vehicle && (
                            <Text style={styles.vehicle}>
                              • {task.courier.vehicle} • {task.courier.plate}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={styles.courierActions}>
                      <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                        <Ionicons name="call" size={20} color={COLORS.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton} onPress={handleChat}>
                        <Ionicons name="chatbubble" size={20} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              )}

              <View style={styles.timelineContainer}>
                <Text style={styles.timelineTitle}>Order Status</Text>
                {statusTimeline.map((item, index) => (
                  <View key={item.status} style={styles.timelineItem}>
                    <View style={styles.timelineIconContainer}>
                      <View
                        style={[
                          styles.timelineIcon,
                          item.completed && styles.timelineIconCompleted,
                          currentStatusIndex === index && styles.timelineIconActive,
                        ]}
                      >
                        {item.completed && (
                          <Ionicons name="checkmark" size={16} color={COLORS.white} />
                        )}
                      </View>
                      {index < statusTimeline.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            item.completed && styles.timelineLineCompleted,
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text
                        style={[
                          styles.timelineLabel,
                          item.completed && styles.timelineLabelCompleted,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {currentStatusIndex === index && (
                        <Text style={styles.timelineTime}>In progress</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <Card style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Task Information</Text>

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="ellipse" size={12} color={COLORS.primary} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Pickup</Text>
                    <Text style={styles.detailValue}>{task.pickup}</Text>
                  </View>
                </View>

                <View style={styles.dashedLine} />

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="location" size={16} color={COLORS.error} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Drop-off</Text>
                    <Text style={styles.detailValue}>{task.dropoff}</Text>
                  </View>
                </View>
              </Card>

              <Card style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Payment</Text>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Total Amount</Text>
                  <Text style={styles.paymentValue}>₱{task.price}</Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Payment Method</Text>
                  <Text style={styles.paymentMethod}>Cash on Delivery</Text>
                </View>
              </Card>
            </>
          )}
        </ScrollView>

        {task.status !== 'completed' && task.status !== 'cancelled' && (
          <View style={styles.footer}>
            <Button
              title="Cancel Request"
              variant="outline"
              onPress={handleCancel}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.paddingLarge,
    paddingTop: 60,
    paddingBottom: SIZES.padding,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  menuButton: {
    padding: 4,
  },
  mapContainer: {
    height: 450,
    position: 'relative',
  },
  mapPlaceholder: {
    height: '100%',
    backgroundColor: '#e8f5f0',
    paddingVertical: 40,
  },
  mapContent: {
    height: '100%',
    justifyContent: 'space-around',
    paddingHorizontal: SIZES.paddingLarge,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    gap: SIZES.margin,
    ...SHADOWS.medium,
  },
  locationMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropoffMarker: {
    backgroundColor: '#fee2e2',
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.textGray,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  routeVisualization: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  routePath: {
    alignItems: 'center',
  },
  pathSegment: {
    width: 3,
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  courierMarker: {
    position: 'relative',
    marginVertical: 10,
  },
  courierPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    opacity: 0.2,
    top: -10,
    left: -10,
  },
  courierIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
  },
  etaBadge: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSmall,
    borderRadius: SIZES.radiusLarge,
    gap: 6,
    ...SHADOWS.medium,
  },
  etaText: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusLarge * 1.5,
    borderTopRightRadius: SIZES.radiusLarge * 1.5,
    paddingTop: SIZES.paddingSmall,
    paddingBottom: 100,
    ...SHADOWS.large,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SIZES.margin,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.paddingLarge,
    marginBottom: SIZES.margin,
    gap: SIZES.margin,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.paddingSmall,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  sheetContent: {
    paddingHorizontal: SIZES.paddingLarge,
  },
  courierCard: {
    marginBottom: SIZES.margin,
  },
  courierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courierInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: SIZES.margin,
  },
  courierAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  courierName: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  vehicle: {
    fontSize: SIZES.small,
    color: COLORS.textGray,
  },
  courierActions: {
    flexDirection: 'row',
    gap: SIZES.marginSmall,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineContainer: {
    marginBottom: SIZES.marginLarge,
  },
  timelineTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SIZES.margin,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SIZES.margin,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: SIZES.margin,
  },
  timelineIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconCompleted: {
    backgroundColor: COLORS.primary,
  },
  timelineIconActive: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.secondary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: COLORS.primary,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineLabel: {
    fontSize: SIZES.body,
    color: COLORS.textGray,
  },
  timelineLabelCompleted: {
    color: COLORS.textDark,
    fontWeight: '600',
  },
  timelineTime: {
    fontSize: SIZES.tiny,
    color: COLORS.primary,
    marginTop: 2,
  },
  detailsCard: {
    marginBottom: SIZES.margin,
  },
  detailsTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SIZES.margin,
  },
  detailRow: {
    flexDirection: 'row',
    gap: SIZES.margin,
  },
  detailIcon: {
    paddingTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.textGray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: SIZES.body,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  dashedLine: {
    height: 30,
    marginLeft: 6,
    marginVertical: 4,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    borderStyle: 'dashed',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.marginSmall,
  },
  paymentLabel: {
    fontSize: SIZES.body,
    color: COLORS.textGray,
  },
  paymentValue: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  paymentMethod: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  footer: {
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default LiveTrackingScreen;
