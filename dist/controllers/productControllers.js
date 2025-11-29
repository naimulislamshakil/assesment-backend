import { catchAsyncError } from '../middlewares/catchAsyncError';
import { ErrorHandler } from '../middlewares/error';
import admin from 'firebase-admin';
import { db } from '../app';
export const addProduct = catchAsyncError(async (req, res, next) => {
    try {
        const { image, productName, price, category, status, stock, description, } = req.body;
        if (!image || !productName || !price || !category || !status || !stock) {
            return next(new ErrorHandler('All field are required.', 400));
        }
        const sku = generateSKU(category);
        const productData = {
            image,
            productName,
            price,
            category,
            status,
            stock,
            sku,
            description,
            createAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const product = await db.collection('products').doc().set(productData);
        res
            .status(200)
            .json({ success: true, message: 'Product create successfully.' });
    }
    catch (error) {
        next(new ErrorHandler('Product create failed', 400));
    }
});
function generateSKU(category) {
    if (!category)
        return null;
    // Take first 3 letters of category and make uppercase
    const prefix = category.slice(0, 3).toUpperCase();
    // Generate 6 random digits
    const digits = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${digits}`;
}
export const getAllProduct = catchAsyncError(async (req, res, next) => {
    const snapshot = await db.collection('products').get();
    const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    res.status(200).json({
        success: true,
        message: 'Get all product.',
        products,
    });
});
export const deleteProduct = catchAsyncError(async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new ErrorHandler('Product ID is required.', 400));
        }
        await db.collection('products').doc(id).delete();
        res
            .status(200)
            .json({ success: true, message: 'Product delete successfully.' });
    }
    catch (error) {
        next(new ErrorHandler('Failed to delete product.', 400));
    }
});
export const getSingleProductById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new ErrorHandler('Product ID is required', 400));
    }
    try {
        const productDoc = await db.collection('products').doc(id).get();
        if (!productDoc.exists) {
            return next(new ErrorHandler('Product not found', 404));
        }
        res.status(200).json({
            success: true,
            product: { id: productDoc.id, ...productDoc.data() },
        });
    }
    catch (error) {
        next(new ErrorHandler('Failed to fetch product', 500));
    }
});
export const editProduct = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const updatedData = req.body;
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Product ID is required.',
        });
    }
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();
    if (!productDoc.exists) {
        return res.status(404).json({
            success: false,
            message: 'Product not found.',
        });
    }
    await productRef.update({
        ...updatedData,
        updatedAt: Date.now(),
    });
    return res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
    });
});
export const getProductsAddedOverTime = async (req, res, next) => {
    try {
        const snapshot = await db.collection('products').get();
        const map = {};
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.createAt)
                return;
            const date = data.createAt.toDate();
            // 👉 Format: YYYY-MM-DD
            const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            map[day] = (map[day] || 0) + 1;
        });
        // Convert map → array for Recharts
        const chartData = Object.keys(map).map((day) => ({
            day,
            total: map[day],
        }));
        // Sort by date ascending
        chartData.sort((a, b) => a.day.localeCompare(b.day));
        res.status(200).json({
            success: true,
            chartData,
        });
    }
    catch (error) {
        next(new ErrorHandler('Failed to get analytics', 500));
    }
};
export const getCategoryDistribution = async (req, res, next) => {
    try {
        const snapshot = await db.collection('products').get();
        const map = {};
        snapshot.forEach((doc) => {
            const data = doc.data();
            const category = data.category || 'Unknown';
            map[category] = (map[category] || 0) + 1;
        });
        const chartData = Object.keys(map).map((category) => ({
            category,
            count: map[category],
        }));
        return res.status(200).json({ success: true, chartData });
    }
    catch (error) {
        next(new ErrorHandler('Failed to get category distribution', 500));
    }
};
export const getStockValueByProduct = async (req, res, next) => {
    try {
        const snapshot = await db.collection('products').get();
        const chartData = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            chartData.push({
                productName: data.productName,
                stockValue: Number(data.price) * Number(data.stock),
            });
        });
        return res.status(200).json({ success: true, chartData });
    }
    catch (error) {
        next(new ErrorHandler('Failed to get stock value', 500));
    }
};
