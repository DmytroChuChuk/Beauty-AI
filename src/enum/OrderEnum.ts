export enum OrderItemEnum {
    custom_recharge = 0,
    bundle_recharge = 1,
    transaction = 2,
    refund = 3,
    credits_movement = 4,
    loyalty_points = 5,
    agency_incentive = 6,
  }
  
  export enum OrderStatusEnum {
    pending = 0,
    unsuccessful = 1,
    completed = 2,
    rejected = 3,
    error = -1,
    refunded = 4,
    pending_refund = 5,
    refund_rejected = 6,
    cancel = 7,
  }
  
  export enum OrderGatewayEnum {
    STRIPE = 0,
    CREDIT = 1,
  }
  
  export enum SecurityRange {
    threeDays = 0,
    sevenDays = 1,
    fifteenDays = 2,
  }
  
  export enum MovementEnum {
    pending_to_income = 0,
    income_to_cash = 1,
  }
  
  export enum WiseWithdrawStatusEnum {
    sent = 'outgoing_payment_sent',
    refunded = 'funds_refunded'
  }
  