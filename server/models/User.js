import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      uniquie: true,
    },
    password: {
      type: String,
      required: false,
      min: 5,
    },
    googleId: {
      type: String,
      required: false,
    },
    profilePic: {
      type: String,
      default: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgaWQ9IlNWR1JlcG9fYmdDYXJyaWVyIiBzdHJva2Utd2lkdGg9IjAiPjwvZz48ZyBpZD0iU1ZHUmVwb190cmFjZXJDYXJyaWVyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvZz48ZyBpZD0iU1ZHUmVwb19pY29uQ2FycmllciI+IDxwYXRoIGQ9Ik0xMi4xMiAxMi43OEMxMi4wNSAxMi43NyAxMS45NiAxMi43NyAxMS44OCAxMi43OEMxMC4xMiAxMi43MiA4LjcxOTk3IDExLjI4IDguNzE5OTcgOS41MDk5OEM4LjcxOTk3IDcuNjk5OTggMTAuMTggNi4yMjk5OCAxMiA2LjIyOTk4QzEzLjgxIDYuMjI5OTggMTUuMjggNy42OTk5OCAxNS4yOCA5LjUwOTk4QzE1LjI3IDExLjI4IDEzLjg4IDEyLjcyIDEyLjEyIDEyLjc4WiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+IDxwYXRoIGQ9Ik0xOC43NCAxOS4zODAxQzE2Ljk2IDIxLjAxMDEgMTQuNiAyMi4wMDAxIDEyIDIyLjAwMDFDOS40MDAwMSAyMi4wMDAxIDcuMDQwMDEgMjEuMDEwMSA1LjI2MDAxIDE5LjM4MDFDNS4zNjAwMSAxOC40NDAxIDUuOTYwMDEgMTcuNTIwMSA3LjAzMDAxIDE2LjgwMDFDOS43NzAwMSAxNC45ODAxIDE0LjI1IDE0Ljk4MDEgMTYuOTcgMTYuODAwMUMxOC4wNCAxNy41MjAxIDE4LjY0IDE4LjQ0MDEgMTguNzQgMTkuMzgwMVoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPiA8cGF0aCBkPSJNMTIgMjJDMTcuNTIyOCAyMiAyMiAxNy41MjI4IDIyIDEyQzIyIDYuNDc3MTUgMTcuNTIyOCAyIDEyIDJDNi40NzcxNSAyIDIgNi40NzcxNSAyIDEyQzIgMTcuNTIyOCA2LjQ3NzE1IDIyIDEyIDIyWiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+IDwvZz48L3N2Zz4=',
    },
    city: String,
    state: String,
    country: String,
    occupation: String,
    phoneNumber: String,
    transactions: Array,
    role: {
      type: String,
      enum: [ "user", "admin", "superadmin" ],
      default: "user",
    },
  },
  {
    timestamps: true
  }
)

const User = mongoose.model( 'User', UserSchema )

export default User