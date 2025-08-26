import CardMock from '../../../components/CardMock'
import ApplyCardForm from '../../../components/ApplyCardForm'

export default function Cards(){
	return (
		<div className="grid gap-6">
			<div className="flex justify-center">
				<CardMock holder="SUPPORT USER" last4="0064" />
			</div>

			<section>
				<h2 className="" style={{ marginTop: 0 }}>Apply for a WilliamsHoldings Visa</h2>
				<p>Our Visa card works worldwide. Physical and virtual cards supported. No annual fee for qualifying accounts.</p>
				<div className="mt-3">
					<ApplyCardForm />
				</div>
			</section>
		</div>
	)
}
