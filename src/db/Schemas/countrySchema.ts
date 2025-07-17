import { Schema, model, Document } from 'mongoose';

interface ICountry extends Document {
    name: string;
    code: string;
}

const CountrySchema = new Schema<ICountry>({
    name: {type: String, required: true},
    code: {type: String, required: true}
});

const Country = model<ICountry>("countries", CountrySchema);

export default Country;