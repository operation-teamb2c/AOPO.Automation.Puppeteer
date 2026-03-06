import { runStep, summarizeResult } from "../helper/baseService.js";
import { accessEVChargingStep } from "../helper/core/accessWeb.js";
import { fetchUserLocation } from "../helper/fetch.js";
import { login } from "../interactions/account.js";
import { chooseCharger } from "../interactions/charging.js";
import { accessScanCharging } from "../interactions/home.js";

export const orderProcess = async (page, data, browser, step = [], stepResult = {}) => {
    const { isMobileWeb = false, id: scenarioId } = data;
    let products = {}
    const options = {
        __options: true,
        merge: false,
        mergeInternal: true,
        scenarioId
    };

    const stop = () => summarizeResult(stepResult, step);

    const accessLoginPage = await runStep(stepResult, step, 'Access Astra Otopower', accessEVChargingStep, page, data, { __options: true, scenarioId: data.id });
    if (accessLoginPage.status !== 200) return stop();

    const loginResult = await runStep(stepResult, step, 'Login', login, page, data, { __options: true, scenarioId });
    if (loginResult.status !== 200) return stop();

    const accessScanChargingResult = await runStep(stepResult, step, 'Access Scan Charging Page', accessScanCharging, page, { __options: true, scenarioId });
    if (accessScanChargingResult.status !== 200) return stop();

    const chooseChargerResult = await runStep(stepResult, step, 'Pilih Charger', chooseCharger, page, data, { __options: true, scenarioId });
    console.log('chooseChargerResult >>', chooseChargerResult);
    if (chooseChargerResult.status !== 200) return stop();

    // // 1. Login
    // await runStep(stepResult, step, 'Access Login Page', accessLoginPage, page, isMobileWeb, { __options: true, scenarioId });
    // const resultLogin = await runStep(stepResult, step, 'Login', login, page, scenario, browser, { __options: true, scenarioId });
    // if (resultLogin.status !== 200) return stop();
    // const { isEmptyCart, userID, accessToken, totalData } = resultLogin;

    // // 2. Get customer point + Cleansing cart
    // const getPoint = await runStep(stepResult, step, 'Check Customer Point', getCustomerPoint, page, { __options: true, scenarioId });
    // const customerPoint = getPoint?.data?.point ?? 0;
    // if (getPoint.status !== 200) return stop();

    // const cleansingCart = await runStep(stepResult, step, 'Cleansing Cart', cleansingProductInCart, page, isEmptyCart, totalData, isMobileWeb, { __options: true, scenarioId });
    // if (!cleansingCart.isEmptyCart) return stop();

    // // 3. Add to cart
    // const addToCart = await runStep(stepResult, step, 'Add To Cart', handleAddToCart, page, scenario, accessToken, scenarioId, isMobileWeb, options);
    // products = addToCart?.products ?? {};
    // if (addToCart.status !== 200) return stop();

    // const locationData = {
    //     latitude: stepResult['Set Customer Location']?.latitude ?? null,
    //     longitude: stepResult['Set Customer Location']?.longitude ?? null
    // };
    // // 4. Process in cart
    // const accessCart = await runStep(stepResult, step, 'Access Cart Page', accessCartPage, page, { __options: true, scenarioId });
    // if (accessCart.status !== 200) return stop();

    // const checklistProduct = await runStep(stepResult, step, 'Checklist Product In Cart', checklistProductInCart, page, scenario, { __options: true, scenarioId });
    // if (checklistProduct.status !== 200) return stop();

    // const applyPoint = await runStep(stepResult, step, 'Apply Point In Cart', applyPointInCart, page, scenario, customerPoint, { __options: true, scenarioId });
    // const applyCoupon = await runStep(stepResult, step, 'Apply Coupon In Cart', applyCouponInCart, page, scenario, { __options: true, scenarioId });

    // // 5. Process in checkout
    // const accessCheckout = await runStep(stepResult, step, 'Access Checkout Page', accessCheckoutPageProcess, page, applyPoint, applyCoupon, isMobileWeb, { __options: true, scenarioId });
    // if (accessCheckout.status !== 200) return stop();

    // await runStep(stepResult, step, 'Apply Point In Checkout', applyPointInCheckout, page, scenario, customerPoint, isMobileWeb, { __options: true, scenarioId });
    // await runStep(stepResult, step, 'Apply Coupon In Checkout', applyCouponInCheckout, page, scenario, isMobileWeb, { __options: true, scenarioId });

    // const productType = products?.productType[0] ?? null
    // const setShipment = await runStep(stepResult, step, 'Set Delivery Method', setDeliveryMethod, page, productType, isMobileWeb, { __options: true, scenarioId });
    // const isContinuePayment = setShipment.status === 200 || setShipment.status === 204;
    // if (!isContinuePayment) return stop();

    // const setPayment = await runStep(stepResult, step, 'Set Payment Method', setPaymentMethod, page, scenario.paymentMethod, isMobileWeb, { __options: true, scenarioId });
    // if (setPayment.status !== 200) return stop();

    // const createOrder = await runStep(stepResult, step, 'Create Order', order, page, productType, accessToken, userID, locationData, isMobileWeb, { __options: true, scenarioId });
    // if (createOrder.status !== 200) return stop();

    // const { orderNumber, usedPoint: orderPoint, products: stockAfterOrder, qty: orderQty, paymentMethod, urlKey } = createOrder.data;
    // const pointAfterOrder = createOrder.point;

    // // 6. Cancel order
    // let cancelOrder = { status: 500, message: 'Payment method not supported for cancellation via web customer' };
    // if (paymentMethod.includes('VA') || paymentMethod.includes('Alfamart')) {
    //     await runStep(stepResult, step, 'Access History Order', accessOrderHistory, page, { __options: true, scenarioId });
    //     await runStep(stepResult, step, 'Access Detail Order', accessDetailOrderBySearchOrderNumber, page, orderNumber, { __options: true, scenarioId });
    //     cancelOrder = await runStep(stepResult, step, 'Cancel Order', cancelVirtualAccount, page, urlKey, accessToken, userID, locationData, createOrder, { __options: true, scenarioId });
    // } else if (paymentMethod.includes('Credit')) {
    //     cancelOrder = await runStep(stepResult, step, 'Cancel Order', cancelCreditCard, page, urlKey, accessToken, userID, locationData, createOrder, { __options: true, scenarioId });
    // }
    // if (cancelOrder.status !== 200) return stop();

    // const pointAfterCancel = cancelOrder.point ?? ''
    // const stockAfterCancel = cancelOrder.data ?? ''

    // // 7. Validation
    // const valStock = await runStep(stepResult, step, 'Validate Stock', stockValidation, products, stockAfterOrder, stockAfterCancel, orderQty, { __options: true, scenarioId });
    // const valPoint = await runStep(stepResult, step, 'Validate Point', pointValidation, parseInt(customerPoint.replace(/\./g, '')), orderPoint, pointAfterOrder, pointAfterCancel, { __options: true, scenarioId });

    // const checkData = stop();
    // await page.waitForTimeout(1000000)


    return {
        summary: stop(),
        products: products,
        orderDetail: createOrder?.data,
        valPoint: valPoint.data,
        valStock: valStock.data
    };
}