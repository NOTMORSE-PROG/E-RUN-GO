import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useApp } from '../../context/AppContext';

interface Stop {
  address: string;
  contactName: string;
  contactPhone: string;
  note: string;
  description: string;
  productName: string;
  itemPhoto?: string | null;
  weight: string;
  size: string;
  itemCount: number;
  insurance: boolean;
  itemValue?: string;
}

const CreateTaskScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const { createTask } = useApp();
  const initialTaskType = route?.params?.taskType;

  const [step, setStep] = useState(initialTaskType ? 2 : 1);
  const [taskType, setTaskType] = useState(initialTaskType || '');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupContact, setPickupContact] = useState('');
  const [dropoffContactName, setDropoffContactName] = useState('');
  const [dropoffContactPhone, setDropoffContactPhone] = useState('');
  const [stops, setStops] = useState<Stop[]>([]);
  const [description, setDescription] = useState('');
  const [singleProductName, setSingleProductName] = useState('');
  const [itemPhoto, setItemPhoto] = useState<string | null>(null);
  const [timePreference, setTimePreference] = useState('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [serviceType, setServiceType] = useState('regular');
  const [weight, setWeight] = useState('0-1');
  const [size, setSize] = useState('small');
  const [insurance, setInsurance] = useState(false);
  const [itemValue, setItemValue] = useState('');

  const taskTypes = [
    {
      id: 'send',
      title: 'Send an Item',
      description: 'Parcel, documents, gadgets, etc.',
      icon: 'cube-outline',
      color: COLORS.primary,
    },
    {
      id: 'errand',
      title: 'Run an Errand',
      description: 'Buy items, pick up something',
      icon: 'cart-outline',
      color: '#f59e0b',
    },
    {
      id: 'multistop',
      title: 'Multi-stop Route',
      description: 'Pick up, buy, then deliver',
      icon: 'navigate-outline',
      color: '#8b5cf6',
    },
  ];

  const paymentMethods = [
    { id: 'gcash', label: 'GCash', icon: 'wallet-outline' },
    { id: 'card', label: 'Credit/Debit Card', icon: 'card-outline' },
  ];

  const serviceTypes = [
    { id: 'express', label: 'Instant / Express', description: 'Fastest delivery (30-60 mins)', price: 40 },
    { id: 'regular', label: 'Regular', description: 'Standard delivery (1-2 hours)', price: 0 },
    { id: 'scheduled', label: 'Scheduled', description: 'Schedule for later (cheaper)', price: -10 },
  ];

  const getWeightOptions = () => {
    if (taskType === 'multistop') {
      return [
        { id: '0-1', label: '0-1 kg', droneFee: 20, robotFee: 30 },
        { id: '1-3', label: '1-3 kg', droneFee: 30, robotFee: 40 },
      ];
    } else {
      return [
        { id: '0-1', label: '0-1 kg', droneFee: 20, robotFee: 30 },
        { id: '1-3', label: '1-3 kg', droneFee: 30, robotFee: 40 },
        { id: '3-5', label: '3-5 kg', droneFee: 50, robotFee: 60 },
        { id: '5-10', label: '5-10 kg', droneFee: 80, robotFee: 100 }
      ];
    }
  };

  const getSizeOptions = () => {
    if (taskType === 'multistop') {
      return [
        { id: 'small', label: 'Small', price: 0 },
        { id: 'medium', label: 'Medium', price: 10 },
      ];
    } else {
      return [
        { id: 'small', label: 'Small', price: 0 },
        { id: 'medium', label: 'Medium', price: 10 },
        { id: 'large', label: 'Large', price: 30 },
        { id: 'xlarge', label: 'Extra Large', price: 50 },
      ];
    }
  };

  const weightOptions = getWeightOptions();
  const sizeOptions = getSizeOptions();

  const calculatePrice = () => {
    // Base fares
    const droneBaseFare = 79; // Highest base fare for drone
    const robotBaseFare = 59; // Base fare for robot
    
    // Distance fee (simplified - in a real app, you'd calculate actual distance)
    const distance = 5; // Example distance in km
    const droneDistanceRate = 30; // per km
    const robotDistanceRate = 15; // per km
    
    // Get selected weight and size
    const selectedWeight = weightOptions.find(w => w.id === weight);
    const selectedSize = sizeOptions.find(s => s.id === size);
    const selectedService = serviceTypes.find(s => s.id === serviceType);
    
    // Calculate base price
    const baseFare = droneBaseFare; // Using drone as default for now
    const distanceFee = distance * droneDistanceRate;
    const weightFee = selectedWeight?.droneFee || 0;
    const sizeFee = selectedSize?.price || 0;
    const serviceFee = selectedService?.price || 0;
    
    // Multi-stop fees
    const stopFee = stops.length > 0 ? (stops.length * 10) : 0;
    const monitoringFee = stops.length > 0 ? (stops.length * 10) : 0;
    
    // Insurance
    const insuranceFee = insurance ? 20 : 0;
    
    // Platform fee
    const platformFee = 10;
    
    // Calculate total
    const subtotal = baseFare + distanceFee + weightFee + sizeFee + serviceFee + stopFee + monitoringFee + insuranceFee + platformFee;
    
    return {
      baseFare,
      distanceFee,
      weightFee,
      sizeFee,
      serviceFee,
      stopFee,
      monitoringFee,
      insuranceFee,
      platformFee,
      total: Math.max(0, subtotal), // Ensure total is not negative
    };
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setItemPhoto(result.assets[0].uri);
    }
  };

  const addStop = () => {
    setStops([...stops, { 
      address: '', 
      contactName: '',
      contactPhone: '',
      note: '', 
      description: '', 
      productName: '',
      itemPhoto: null,
      weight: '1-1',  // Default weight
      size: 'small',  // Default size
      itemCount: 1,   // Default item count
      insurance: false, // Default insurance
      itemValue: '', // Default item value
    }]);
  };

  const removeStop = (index) => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  const pickImageForStop = async (index) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newStops = [...stops];
      newStops[index].itemPhoto = result.assets[0].uri;
      setStops(newStops);
    }
  };

  const handleNext = () => {
    if (step < 7) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    const baseFare = 50;
    const distanceFee = 30;
    const stopFees = stops.length * 20;
    const totalPrice = baseFare + distanceFee + stopFees;

    // For multi-stop tasks, use the first stop's description and photo as the main ones
    const mainDescription = taskType === 'multistop' && stops.length > 0 
      ? stops[0].description 
      : description;
    const mainProductName = taskType === 'multistop' && stops.length > 0
      ? stops[0].productName
      : singleProductName;
    const mainItemPhoto = taskType === 'multistop' && stops.length > 0 
      ? stops[0].itemPhoto 
      : itemPhoto;

    // Format dropoff contact for single-stop tasks
    const dropoffContact = taskType === 'multistop' 
      ? '' 
      : `${dropoffContactName}${dropoffContactPhone ? `, ${dropoffContactPhone}` : ''}`;

    const newTask = createTask({
      type: taskType,
      pickup,
      dropoff,
      pickupContact,
      dropoffContact,
      stops,
      productName: mainProductName,
      description: mainDescription,
      itemPhoto: mainItemPhoto,
      timePreference,
      scheduledDate,
      paymentMethod,
      price: totalPrice,
      eta: '15 min',
    });

    navigation.navigate('LiveTracking', { taskId: newTask.id });
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4, 5, 6, 7].map((s) => (
        <View
          key={s}
          style={[
            styles.progressStep,
            s <= step && styles.progressStepActive,
          ]}
        />
      ))}
    </View>
  );

  const renderPackageDetailsForStop = (stop: Stop, index: number) => {
    const updateStop = (updates: Partial<Stop>) => {
      const newStops = [...stops];
      newStops[index] = { ...newStops[index], ...updates };
      setStops(newStops);
    };

    // Check if this stop exceeds weight or size limits
    const exceedsWeightLimit = stop.weight === '5+' || stop.weight === '3-5';
    const exceedsSizeLimit = stop.size === 'large' || stop.size === 'oversized';
    const showWarning = exceedsWeightLimit || exceedsSizeLimit;

    return (
      <Card key={`stop-${index}`} style={[styles.stopCard, showWarning && styles.warningCard]}>
        <Text style={styles.stopTitle}>Stop {index + 1} Package Details</Text>
        
        {stop.itemPhoto && (
          <View style={styles.photoPreviewContainer}>
            <Image source={{ uri: stop.itemPhoto }} style={styles.photoPreview} />
          </View>
        )}
        
        {showWarning && (
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={20} color={COLORS.warning} />
            <Text style={styles.warningText}>
              {exceedsWeightLimit && 'Package exceeds weight limit for multi-stop delivery. '}
              {exceedsSizeLimit && 'Package exceeds size limit for multi-stop delivery. '}
              Consider sending this as a separate "Send an Item" delivery.
            </Text>
          </View>
        )}


        <Input
          label="Product Name"
          value={stop.productName}
          onChangeText={(text) => updateStop({ productName: text })}
          placeholder="Enter product name"
          icon="cube-outline"
        />

        <Text style={styles.label}>Weight per Item</Text>
        <View style={styles.optionsGrid}>
          {weightOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.pillOption,
                stop.weight === option.id && styles.pillOptionActive,
                option.disabled && styles.disabledOption,
              ]}
              onPress={() => updateStop({ weight: option.id })}
              disabled={option.disabled}
            >
              <Text style={[
                styles.pillText,
                stop.weight === option.id && styles.pillTextActive,
                option.disabled && styles.disabledText,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Package Size</Text>
        <View style={styles.optionsGrid}>
          {sizeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.pillOption,
                stop.size === option.id && styles.pillOptionActive,
                option.disabled && styles.disabledOption,
              ]}
              onPress={() => updateStop({ size: option.id })}
              disabled={option.disabled}
            >
              <Text style={[
                styles.pillText,
                stop.size === option.id && styles.pillTextActive,
                option.disabled && styles.disabledText,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Product Details"
          value={stop.description || ''}
          onChangeText={(text) => updateStop({ description: text })}
          placeholder="What's in this package?"
          icon="cube-outline"
        />

        <View style={styles.insuranceContainer}>
          <View style={styles.insuranceHeader}>
            <TouchableOpacity 
              style={styles.insuranceCheckbox}
              onPress={() => updateStop({ insurance: !stop.insurance })}
            >
              <View style={[styles.checkbox, stop.insurance && styles.checkboxChecked]}>
                {stop.insurance && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text style={styles.insuranceText}>Add insurance for this item</Text>
            </TouchableOpacity>
            {stop.insurance && (
              <View style={styles.insuranceDetails}>
                <Text style={styles.insuranceNote}>Item value (required for insurance):</Text>
                <Input
                  label=""
                  value={stop.itemValue || ''}
                  onChangeText={(text) => updateStop({ itemValue: text })}
                  placeholder="Enter item value (₱)"
                  keyboardType="numeric"
                  required={stop.insurance}
                />
                <Text style={styles.insuranceFee}>Insurance fee: ₱20 (2% of item value or ₱20, whichever is higher)</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    );
  };

  const renderServiceTypeStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Service Type</Text>
      <Text style={styles.stepSubtitle}>Choose your delivery speed</Text>
      
      <View style={styles.optionsContainer}>
        {serviceTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.optionCard,
              serviceType === type.id && styles.optionCardActive,
            ]}
            onPress={() => setServiceType(type.id)}
          >
            <View style={styles.optionHeader}>
              <Text style={[
                styles.optionTitle,
                serviceType === type.id && styles.optionTitleActive,
              ]}>
                {type.label}
              </Text>
              <Text style={styles.optionPrice}>
                {type.price > 0 ? `+₱${type.price}` : type.price < 0 ? `-₱${Math.abs(type.price)}` : 'No extra charge'}
              </Text>
            </View>
            <Text style={styles.optionDescription}>{type.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Package Details</Text>
      
      {taskType === 'multistop' ? (
        <>
          <Text style={styles.sectionSubtitle}>Please provide details for each package</Text>
          {stops.map((stop, index) => renderPackageDetailsForStop(stop, index))}
          
          {/* Total Weight and Size Summary */}
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text>Total Items:</Text>
              <Text style={styles.summaryValue}>
                {stops.reduce((sum, stop) => sum + (stop.itemCount || 0), 0)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Total Weight:</Text>
              <Text style={styles.summaryValue}>
                {stops.reduce((sum, stop) => sum + (parseInt(stop.weight) * (stop.itemCount || 1) || 0), 0)} kg
              </Text>
            </View>
            {stops.some(stop => stop.weight === '5+' || stop.size === 'oversized') && (
              <View style={styles.warningContainer}>
                <Ionicons name="warning" size={20} color={COLORS.warning} />
                <Text style={styles.warningText}>
                  Some packages exceed multi-stop delivery limits. Consider sending them separately.
                </Text>
              </View>
            )}
          </Card>
        </>
      ) : (
        // Original single package form
        <>
          <Text style={styles.label}>Weight</Text>
          <View style={styles.optionsGrid}>
            {weightOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.pillOption,
                  weight === option.id && styles.pillOptionActive,
                  option.droneFee === null && styles.robotOnlyOption,
                ]}
                onPress={() => setWeight(option.id)}
                disabled={option.droneFee === null}
              >
                <Text style={[
                  styles.pillText,
                  weight === option.id && styles.pillTextActive,
                  option.droneFee === null && styles.robotOnlyText,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Package Size</Text>
          <View style={styles.optionsGrid}>
            {sizeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.pillOption,
                  size === option.id && styles.pillOptionActive,
                  option.id === 'oversized' && styles.robotOnlyOption,
                ]}
                onPress={() => setSize(option.id)}
              >
                <Text style={[
                  styles.pillText,
                  size === option.id && styles.pillTextActive,
                  option.id === 'oversized' && styles.robotOnlyText,
                ]}>
                  {option.label}
                  {option.price > 0 && ` +₱${option.price}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const renderPriceBreakdown = () => {
    const price = calculatePrice();
    
    return (
      <Card style={styles.priceCard}>
        <Text style={styles.priceCardTitle}>Price Breakdown</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Base Fare</Text>
          <Text style={styles.priceValue}>₱{price.baseFare}</Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Distance Fee</Text>
          <Text style={styles.priceValue}>₱{price.distanceFee}</Text>
        </View>
        
        {price.weightFee > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Weight Fee</Text>
            <Text style={styles.priceValue}>+₱{price.weightFee}</Text>
          </View>
        )}
        
        {price.sizeFee > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Size Fee</Text>
            <Text style={styles.priceValue}>+₱{price.sizeFee}</Text>
          </View>
        )}
        
        {price.serviceFee !== 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Type</Text>
            <Text style={[
              styles.priceValue,
              price.serviceFee < 0 ? styles.discountText : null
            ]}>
              {price.serviceFee > 0 ? `+₱${price.serviceFee}` : `-₱${Math.abs(price.serviceFee)}`}
            </Text>
          </View>
        )}
        
        {price.stopFee > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Additional Stops ({stops.length})</Text>
            <Text style={styles.priceValue}>+₱{price.stopFee + price.monitoringFee}</Text>
          </View>
        )}
        
        {price.insuranceFee > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Insurance</Text>
            <Text style={styles.priceValue}>+₱{price.insuranceFee}</Text>
          </View>
        )}
        
        <View style={styles.priceDivider} />
        
        <View style={styles.priceRow}>
          <Text style={styles.priceTotalLabel}>Total</Text>
          <Text style={styles.priceTotalValue}>₱{price.total}</Text>
        </View>
      </Card>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Choose Task Type</Text>
            <Text style={styles.stepSubtitle}>What do you need help with?</Text>

            <View style={styles.taskTypesContainer}>
              {taskTypes.map((type) => (
                <Card
                  key={type.id}
                  style={[
                    styles.taskTypeCard,
                    taskType === type.id && styles.taskTypeCardActive,
                  ]}
                  onPress={() => setTaskType(type.id)}
                >
                  <View
                    style={[
                      styles.taskTypeIcon,
                      { backgroundColor: `${type.color}20` },
                    ]}
                  >
                    <Ionicons name={type.icon} size={32} color={type.color} />
                  </View>
                  <Text style={styles.taskTypeTitle}>{type.title}</Text>
                  <Text style={styles.taskTypeDescription}>{type.description}</Text>
                </Card>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Pickup & Drop-off</Text>
            <Text style={styles.stepSubtitle}>Where should we go?</Text>

            {/* For 'Run an Errand', show merchant pickup details first */}
            {taskType === 'errand' && (
              <>
                <Text style={styles.sectionTitle}>Pickup Location</Text>
                <Input
                  label="Pickup Location Name"
                  value={pickup}
                  onChangeText={setPickup}
                  placeholder="E.g., Starbucks SM North, John's House, etc."
                  icon="location-outline"
                />
                <Input
                  label="Pickup Address"
                  value={pickupContact}
                  onChangeText={setPickupContact}
                  placeholder="Full address of the pickup location"
                  icon="map-outline"
                />
                <Input
                  label="Contact at Pickup (Optional)"
                  value={dropoffContactPhone || ''}
                  onChangeText={setDropoffContactPhone}
                  placeholder="Contact number at pickup location"
                  icon="call-outline"
                  keyboardType="phone-pad"
                />
                <Text style={styles.sectionTitle}>Deliver To</Text>
                <Input
                  label="Your Address"
                  value={dropoff}
                  onChangeText={setDropoff}
                  placeholder="Enter your delivery address"
                  icon="home-outline"
                />
              </>
            )}

            {taskType === 'send' && (
              <>
                <Input
                  label="Pickup From (Your Location)"
                  value={pickup}
                  onChangeText={setPickup}
                  placeholder="Your address"
                  icon="location-outline"
                />

                <Text style={styles.sectionTitle}>Recipient Details</Text>
                <Input
                  label="Recipient's Address"
                  value={dropoff}
                  onChangeText={setDropoff}
                  placeholder="Enter recipient's address"
                  icon="navigate-outline"
                />

                <View style={styles.row}>
                  <View style={[styles.column, { flex: 2, marginRight: 8 }]}>
                    <Input
                      label="Recipient Name"
                      value={dropoffContactName || ''}
                      onChangeText={setDropoffContactName}
                      placeholder="Recipient's name"
                      icon="person-outline"
                    />
                  </View>
                  <View style={[styles.column, { flex: 2 }]}>
                    <Input
                      label="Recipient Phone"
                      value={dropoffContactPhone || ''}
                      onChangeText={setDropoffContactPhone}
                      placeholder="Recipient's phone"
                      icon="call-outline"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </>
            )}

            {taskType === 'multistop' && (
              <>
                <Text style={styles.sectionTitle}>Your Pickup Location</Text>
                <Input
                  label="Your Address"
                  value={pickup}
                  onChangeText={setPickup}
                  placeholder="Enter your pickup address"
                  icon="home-outline"
                />
                
                <Text style={styles.sectionTitle}>Drop-off Locations</Text>
                {stops.map((stop, index) => (
                  <Card key={index} style={styles.stopCard}>
                    <View style={styles.stopHeader}>
                      <Text style={styles.stopTitle}>Stop {index + 1}</Text>
                      <TouchableOpacity onPress={() => removeStop(index)}>
                        <Ionicons name="close-circle" size={24} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                    <Input
                      label="Address"
                      value={stop.address}
                      onChangeText={(text) => {
                        const newStops = [...stops];
                        newStops[index].address = text;
                        setStops(newStops);
                      }}
                      placeholder="Enter stop address"
                      icon="location-outline"
                    />
                    <View style={styles.row}>
                      <View style={[styles.column, { flex: 2, marginRight: 8 }]}>
                        <Input
                          label="Contact Name"
                          value={stop.contactName || ''}
                          onChangeText={(text) => {
                            const newStops = [...stops];
                            if (!newStops[index]) newStops[index] = {};
                            newStops[index].contactName = text;
                            setStops(newStops);
                          }}
                          placeholder="Recipient's name"
                          icon="person-outline"
                          required
                        />
                      </View>
                      <View style={[styles.column, { flex: 2 }]}>
                        <Input
                          label="Phone Number"
                          value={stop.contactPhone || ''}
                          onChangeText={(text) => {
                            const newStops = [...stops];
                            if (!newStops[index]) newStops[index] = {};
                            newStops[index].contactPhone = text;
                            setStops(newStops);
                          }}
                          placeholder="Recipient's phone number"
                          icon="call-outline"
                          keyboardType="phone-pad"
                          required
                        />
                      </View>
                    </View>
                    <Input
                      label="Note (Optional)"
                      value={stop.note || ''}
                      onChangeText={(text) => {
                        const newStops = [...stops];
                        if (!newStops[index]) newStops[index] = {};
                        newStops[index].note = text;
                        setStops(newStops);
                      }}
                      placeholder="Add any special instructions"
                      icon="document-text-outline"
                      multiline
                    />
                  </Card>
                ))}

                <Button
                  title="Add Stop"
                  onPress={addStop}
                  variant="outline"
                  icon={<Ionicons name="add" size={20} color={COLORS.textDark} />}
                />
              </>
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Task Details</Text>
            <Text style={styles.stepSubtitle}>Tell us more about the task</Text>

            {taskType === 'multistop' ? (
              <View style={styles.stopsContainer}>
                {stops.map((stop, index) => (
                  <Card key={index} style={styles.stopCard}>
                    <Text style={styles.stopTitle}>Stop {index + 1} Details</Text>
                    <Input
                      label={`Product Name for Stop ${index + 1}`}
                      value={stop.productName || ''}
                      onChangeText={(text) => {
                        const newStops = [...stops];
                        newStops[index] = {
                          ...newStops[index],
                          productName: text,
                        };
                        setStops(newStops);
                      }}
                      placeholder="Enter product name"
                      icon="cube-outline"
                    />

                    <Input
                      label={`Product Details for Stop ${index + 1}`}
                      value={stop.description || ''}
                      onChangeText={(text) => {
                        const newStops = [...stops];
                        newStops[index] = {
                          ...newStops[index],
                          description: text,
                        };
                        setStops(newStops);
                      }}
                      placeholder="What needs to be done at this stop?"
                      multiline
                      numberOfLines={3}
                    />

                    <Text style={styles.label}>Item Photo for Stop {index + 1} (Optional)</Text>
                    <TouchableOpacity
                      style={styles.photoUpload}
                      onPress={() => pickImageForStop(index)}
                    >
                      {stop.itemPhoto ? (
                        <Image source={{ uri: stop.itemPhoto }} style={styles.uploadedPhoto} />
                      ) : (
                        <View style={styles.photoPlaceholder}>
                          <Ionicons name="camera-outline" size={24} color={COLORS.textGray} />
                          <Text style={styles.photoText}>Add Photo</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            ) : (
              <>
                <Input
                  label="Product Name"
                  value={singleProductName}
                  onChangeText={setSingleProductName}
                  placeholder="Enter product name"
                  icon="cube-outline"
                />

                <Input
                  label="Product Details"
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What needs to be done?"
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.label}>Item Photo (Optional)</Text>
                <TouchableOpacity style={styles.photoUpload} onPress={pickImage}>
                  {itemPhoto ? (
                    <Image source={{ uri: itemPhoto }} style={styles.uploadedPhoto} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="camera-outline" size={32} color={COLORS.textGray} />
                      <Text style={styles.photoText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Removed 'When do you need this?' section as requested */}
          </View>
        );

      case 4:
        return renderServiceTypeStep();

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Price & Payment</Text>
            <Text style={styles.stepSubtitle}>Review your order</Text>

            {renderPriceBreakdown()}

            <Text style={styles.label}>Payment Method</Text>
            {[
              { id: 'gcash', label: 'GCash', icon: 'wallet' },
              { id: 'card', label: 'Credit/Debit Card', icon: 'card' },
            ].map((method) => (
              <Card
                key={method.id}
                style={[
                  styles.paymentCard,
                  paymentMethod === method.id && styles.paymentCardActive,
                ]}
                onPress={() => setPaymentMethod(method.id)}
              >
                <Ionicons
                  name={method.icon}
                  size={24}
                  color={paymentMethod === method.id ? COLORS.primary : COLORS.textGray}
                />
                <Text
                  style={[
                    styles.paymentLabel,
                    paymentMethod === method.id && styles.paymentLabelActive,
                  ]}
                >
                  {method.label}
                </Text>
                {paymentMethod === method.id && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                )}
              </Card>
            ))}

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                Price is estimated and may adjust slightly based on actual distance
              </Text>
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
              </View>
              <Text style={styles.successTitle}>Order Confirmed!</Text>
              <Text style={styles.successSubtitle}>
                Dispatching drone to your location...
              </Text>

              <Card style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>From</Text>
                  <Text style={styles.summaryValue}>{pickup}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>To</Text>
                  <Text style={styles.summaryValue}>{dropoff}</Text>
                </View>
                {stops.length > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Stops</Text>
                    <Text style={styles.summaryValue}>{stops.length} additional</Text>
                  </View>
                )}
              </Card>
            </View>
          </View>
        );

      case 7:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
              </View>
              <Text style={styles.successTitle}>Order Confirmed!</Text>
              <Text style={styles.successSubtitle}>
                Dispatching drone to your location...
              </Text>

              <Card style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>From</Text>
                  <Text style={styles.summaryValue}>{pickup}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>To</Text>
                  <Text style={styles.summaryValue}>{dropoff}</Text>
                </View>
                {stops.length > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Stops</Text>
                    <Text style={styles.summaryValue}>{stops.length} additional</Text>
                  </View>
                )}
              </Card>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Task</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderProgressBar()}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        {step < 7 && (
          <Button
            title={step === 6 ? 'Confirm Order' : 'Next'}
            onPress={handleNext}
            disabled={
              (step === 1 && !taskType) ||
              (step === 2 && (
                taskType === 'multistop' 
                  ? !pickup || stops.some(stop => !stop.address)
                  : !pickup || !dropoff
              )) ||
              (step === 3 && (
                taskType === 'multistop' 
                  ? stops.length === 0 || stops.some(stop => 
                      !stop.productName
                    )
                  : !singleProductName || !description
              ))
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... existing styles ...
  photoPreviewContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  photoPreview: {
    width: 150,
    height: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insuranceContainer: {
    marginTop: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 15,
    backgroundColor: COLORS.lightGray,
  },
  insuranceHeader: {
    width: '100%',
  },
  insuranceCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insuranceDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  insuranceNote: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 8,
  },
  insuranceFee: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  insuranceText: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.paddingLarge,
    paddingTop: 60,
    paddingBottom: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.padding,
    gap: SIZES.marginSmall,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.paddingLarge,
  },
  stepContainer: {
    paddingVertical: SIZES.paddingLarge,
  },
  stepTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SIZES.marginSmall,
  },
  stepSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.textGray,
    marginBottom: SIZES.marginLarge,
  },
  taskTypesContainer: {
    gap: SIZES.margin,
  },
  taskTypeCard: {
    alignItems: 'center',
    paddingVertical: SIZES.paddingLarge,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  taskTypeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondary,
  },
  taskTypeIcon: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.margin,
  },
  taskTypeTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  taskTypeDescription: {
    fontSize: SIZES.small,
    color: COLORS.textGray,
    textAlign: 'center',
  },
  stopCard: {
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.marginSmall,
  },
  stopTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  label: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SIZES.marginSmall,
  },
  photoUpload: {
    marginBottom: SIZES.marginLarge,
  },
  photoPlaceholder: {
    height: 200,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.backgroundGray,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedPhoto: {
    height: 200,
    borderRadius: SIZES.radius,
    resizeMode: 'cover',
  },
  photoText: {
    fontSize: SIZES.small,
    color: COLORS.textGray,
    marginTop: SIZES.marginSmall,
  },
  timePreferenceContainer: {
    flexDirection: 'row',
    gap: SIZES.margin,
    marginBottom: SIZES.marginLarge,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.backgroundGray,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SIZES.marginSmall,
  },
  timeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  timeButtonTextActive: {
    color: COLORS.white,
  },
  priceCard: {
    marginBottom: SIZES.marginLarge,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.marginSmall,
  },
  priceLabel: {
    fontSize: SIZES.small,
    color: COLORS.textGray,
  },
  priceValue: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.margin,
  },
  priceTotalLabel: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  priceTotalValue: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin,
    marginBottom: SIZES.margin,
    paddingVertical: SIZES.padding,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  paymentCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondary,
  },
  paymentLabel: {
    flex: 1,
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  paymentLabelActive: {
    color: COLORS.primary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    padding: SIZES.padding,
    borderRadius: SIZES.radiusSmall,
    gap: SIZES.marginSmall,
    marginTop: SIZES.margin,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.tiny,
    color: COLORS.primary,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.paddingLarge * 2,
  },
  successIcon: {
    marginBottom: SIZES.marginLarge,
  },
  successTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SIZES.marginSmall,
  },
  successSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: SIZES.marginLarge * 2,
  },
  summaryCard: {
    width: '100%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.marginSmall,
  },
  summaryLabel: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  summaryValue: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.textDark,
    textAlign: 'right',
  },
  // New styles for service type and pricing
  optionsContainer: {
    gap: SIZES.margin,
    marginBottom: SIZES.marginLarge,
  },
  optionCard: {
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondary,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.marginSmall,
  },
  optionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  optionTitleActive: {
    color: COLORS.primary,
  },
  optionPrice: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  optionDescription: {
    fontSize: SIZES.small,
    color: COLORS.textGray,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: SIZES.marginLarge,
    marginBottom: SIZES.margin,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.marginSmall,
    marginBottom: SIZES.marginLarge,
  },
  pillOption: {
    paddingVertical: SIZES.paddingSmall,
    paddingHorizontal: SIZES.padding,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillOptionActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  robotOnlyOption: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
  },
  pillText: {
    fontSize: SIZES.small,
    color: COLORS.textGray,
  },
  pillTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  robotOnlyText: {
    color: COLORS.textGray,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    marginBottom: SIZES.marginLarge,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SIZES.marginSmall,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: SIZES.body,
    color: COLORS.textDark,
  },
  priceCardTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SIZES.margin,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.marginSmall,
  },
  priceLabel: {
    fontSize: SIZES.body,
    color: COLORS.textGray,
  },
  priceValue: {
    fontSize: SIZES.body,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  priceDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.margin,
  },
  priceTotalLabel: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  priceTotalValue: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  discountText: {
    color: COLORS.success,
  },
  footer: {
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default CreateTaskScreen;
