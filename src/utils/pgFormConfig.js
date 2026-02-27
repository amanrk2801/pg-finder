export const FACILITY_OPTIONS = [
    { key: 'mess', label: 'Mess' },
    { key: 'drinkingWater', label: 'Drinking Water' },
    { key: 'wifi', label: 'WiFi' },
    { key: 'laundry', label: 'Laundry' },
    { key: 'powerBackup', label: 'Power Backup' },
];

export const SAFETY_OPTIONS = [
    { key: 'cctv', label: 'CCTV' },
    { key: 'security', label: '24/7 Security' },
    { key: 'warden', label: 'Female Warden' },
    { key: 'biometric', label: 'Biometric Entry' },
];

const SAFETY_LABEL_MAP = {
    cctv: 'CCTV',
    security: '24/7 Security',
    warden: 'Female Warden',
    biometric: 'Biometric Entry',
};

export const DEFAULT_PLACEHOLDER_IMAGES = [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
];

export function facilitiesMapToArray(map) {
    return FACILITY_OPTIONS
        .filter(({ key }) => map[key])
        .map(({ label }) => label);
}

export function safetyMapToArray(map) {
    return SAFETY_OPTIONS
        .filter(({ key }) => map[key])
        .map(({ key }) => SAFETY_LABEL_MAP[key]);
}

export function facilitiesArrayToMap(arr = []) {
    const map = {};
    FACILITY_OPTIONS.forEach(({ key, label }) => {
        map[key] = arr.some(f => f.toLowerCase() === label.toLowerCase());
    });
    return map;
}

export function safetyArrayToMap(arr = []) {
    const map = {};
    SAFETY_OPTIONS.forEach(({ key }) => {
        map[key] = arr.includes(SAFETY_LABEL_MAP[key]);
    });
    return map;
}

export function validatePGForm(formData, { requireBeds = false } = {}) {
    const errors = {};

    if (!formData.name.trim()) {
        errors.name = 'Property Name is required';
    }
    if (!formData.address.trim()) {
        errors.address = 'Address is required';
    }
    if (!formData.totalRooms) {
        errors.totalRooms = 'Total Rooms is required';
    } else if (isNaN(formData.totalRooms) || parseInt(formData.totalRooms) <= 0) {
        errors.totalRooms = 'Enter a valid number';
    }
    if (!formData.rent) {
        errors.rent = 'Monthly Rent is required';
    } else if (isNaN(formData.rent) || parseInt(formData.rent) <= 0) {
        errors.rent = 'Enter a valid amount';
    }

    if (requireBeds) {
        if (!formData.totalBeds) errors.totalBeds = 'Total Beds is required';
        if (!formData.vacantBeds) errors.vacantBeds = 'Vacant Beds is required';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
}
