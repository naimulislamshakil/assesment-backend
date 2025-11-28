import { FieldValue } from "firebase/firestore";

export interface Product {
	productName: string;
	sku: string | null;
	price: number;
	category: string;
	status: string;
	stock: number;
	description: string;
	image: string;
	createAt: FieldValue;
	updateAt?: FieldValue;
}
